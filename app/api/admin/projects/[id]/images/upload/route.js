import { put } from '@vercel/blob';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: 'public',
    });

    const imageUrl = blob.url;

    const newImage = await prisma.image.create({
      data: {
        url: imageUrl,
        projectId: parseInt(params.id),
      },
    });

    return NextResponse.json(newImage, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
