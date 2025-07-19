import { del } from '@vercel/blob';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  try {
    const { id, imageId } = params;
    const projectId = parseInt(id);
    const imageIdInt = parseInt(imageId);

    if (isNaN(projectId) || isNaN(imageIdInt)) {
      return NextResponse.json({ error: 'Invalid project or image ID' }, { status: 400 });
    }

    // ✅ Make sure the image belongs to the given project
    const image = await prisma.image.findFirst({
      where: {
        id: imageIdInt,
        projectId: projectId,
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found for this project' }, { status: 404 });
    }

    // Optional: log it
    console.log('Deleting blob:', image.url);

    // Delete from Vercel Blob
    try {
      await del(image.url);
    } catch (blobError) {
      console.error('Blob deletion failed:', blobError);
    }

    // Delete from database
    await prisma.image.delete({
      where: { id: imageIdInt },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: 'Server error during deletion' }, { status: 500 });
  }
}
