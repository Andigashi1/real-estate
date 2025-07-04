import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { images: true },
  });
  return NextResponse.json(projects);
}

export async function POST(request) {
  try {
    const data = await request.json();

    const project = await prisma.project.create({
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

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Error creating project" }, { status: 500 });
  }
}
