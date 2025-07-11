import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const id = parseInt(params.id);
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}
