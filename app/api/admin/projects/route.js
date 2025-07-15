import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

// GET all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        images: true,
        unitTypes: {
          orderBy: { bedrooms: "asc" },
        },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Error fetching projects" },
      { status: 500 }
    );
  }
}

// POST (create) a new project
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (
      !data.title ||
      !data.slug ||
      !data.unitTypes ||
      !Array.isArray(data.unitTypes)
    ) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, and unitTypes array" },
        { status: 400 }
      );
    }

    // Calculate min/max prices for the overall project
    const allPrices = data.unitTypes
      .flatMap((unit) => [unit.minPrice, unit.maxPrice])
      .filter((p) => typeof p === "number" && !isNaN(p));

    if (allPrices.length === 0) {
      return NextResponse.json(
        { error: "Missing minPrice or maxPrice in unitTypes" },
        { status: 400 }
      );
    }

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    // Calculate min/max areas for the overall project
    const allAreas = data.unitTypes
      .flatMap((unit) => [unit.minArea, unit.maxArea])
      .filter((a) => typeof a === "number" && !isNaN(a));

    if (allAreas.length === 0) {
      return NextResponse.json(
        { error: "Missing minArea or maxArea in unitTypes" },
        { status: 400 }
      );
    }

    const minArea = Math.min(...allAreas);
    const maxArea = Math.max(...allAreas);

    // Create the project and unit types
    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        location: data.location,
        type: data.type,
        developer: data.developer,
        furnished: data.furnished,
        newLaunch: data.newLaunch || false,
        unitTypes: {
          create: data.unitTypes.map((unit) => ({
            bedrooms: unit.bedrooms,
            minPrice: unit.minPrice,
            maxPrice: unit.maxPrice,
            price: unit.price,
            minArea: unit.minArea,
            maxArea: unit.maxArea,
          })),
        },
      },
      include: {
        images: true,
        unitTypes: {
          orderBy: { bedrooms: "asc" },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Error creating project" },
      { status: 500 }
    );
  }
}