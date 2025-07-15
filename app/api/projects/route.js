import { prisma } from "../../lib/prisma"; // Adjust the path to your prisma instance
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        unitTypes: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
