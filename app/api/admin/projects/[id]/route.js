import { prisma } from "@/app/lib/prisma";
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(req, { params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const data = await req.json();

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        area: data.area,
        bedrooms: data.bedrooms,
        location: data.location,
        type: data.type,
        developer: data.developer,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating project:', err);
    return NextResponse.json({ error: 'Error updating project' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    return NextResponse.json({ error: 'Error deleting project' }, { status: 500 });
  }
}
