import { put } from '@vercel/blob';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Invalid file received' }, { status: 400 });
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, { access: 'public' });

    if (!blob?.url) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Save the image URL to your DB
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
