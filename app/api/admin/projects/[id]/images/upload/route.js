import { put } from '@vercel/blob';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto'; // ✅ Import for random suffix

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Invalid file received' }, { status: 400 });
    }

    // ✅ Generate a unique file name to prevent collision
    const uniqueName = `${Date.now()}-${randomUUID()}-${file.name}`;

    // ✅ Upload file to Vercel Blob with unique name
    const blob = await put(uniqueName, file, { access: 'public' });

    if (!blob?.url) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // ✅ Save the image URL to your DB
    const image = await prisma.image.create({
      data: {
        url: blob.url,
        projectId: parseInt(params.id),
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Server error during upload' }, { status: 500 });
  }
}
