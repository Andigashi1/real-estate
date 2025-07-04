import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/app/lib/prisma'; // update path as needed

export async function POST(request, { params }) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects');

    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/projects/${filename}`;

    // ✅ Save to DB and link to project
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
