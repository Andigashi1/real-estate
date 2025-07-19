import { del } from '@vercel/blob';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  try {
    const { id, imageId } = params;

    // Check if the image exists in the database
    const image = await prisma.image.findUnique({
      where: { id: parseInt(imageId) },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from Vercel Blob storage if the image exists in the database
    try {
      await del(image.url);
    } catch (blobError) {
      console.error('Failed to delete from blob storage:', blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from the database
    await prisma.image.delete({
      where: { id: parseInt(imageId) },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: 'Server error during deletion' }, { status: 500 });
  }
}
