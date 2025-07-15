import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET a single project
export async function GET(req, { params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        images: true,
        unitTypes: {
          orderBy: { bedrooms: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Error fetching project" }, { status: 500 });
  }
}

// PUT (update) a project
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.slug || !data.unitTypes || !Array.isArray(data.unitTypes)) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, and unitTypes array" },
        { status: 400 }
      );
    }

    // Calculate min/max for the overall project
    const allPrices = data.unitTypes.flatMap(unit => [unit.minPrice, unit.maxPrice]);
    const allAreas = data.unitTypes.flatMap(unit => [unit.minArea, unit.maxArea]);

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const minArea = Math.min(...allAreas);
    const maxArea = Math.max(...allAreas);

    // Extract the prices for each unit type, including the "price" field
    const allCheapest = data.unitTypes.flatMap(unit => [unit.cheapest]);
    const allMostExpensive = data.unitTypes.flatMap(unit => [unit.mostExpensive]);
    const cheapestPrice = Math.min(...allCheapest);
    const mostExpensivePrice = Math.max(...allMostExpensive);

    // Create the project and unit types
    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        minPrice,  // Use minPrice for cheapest price
        maxPrice,  // Use maxPrice for most expensive price
        minArea,
        maxArea,
        cheapestPrice, // Add cheapest price
        mostExpensivePrice, // Add most expensive price
        location: data.location,
        type: data.type,
        developer: data.developer,
        furnished: data.furnished,
        newLaunch: data.newLaunch || false,
        unitTypes: {
          create: data.unitTypes.map(unit => ({
            bedrooms: unit.bedrooms,
            minPrice: unit.minPrice,
            maxPrice: unit.maxPrice,
            price: unit.price || 0,  // Default value for missing price
            minArea: unit.minArea,
            maxArea: unit.maxArea,
            cheapest: unit.cheapest,
            mostExpensive: unit.mostExpensive,
          }))
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
    return NextResponse.json({ error: "Error creating project" }, { status: 500 });
  }
}


// DELETE a project
export async function DELETE(req, { params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    // Ensure images are removed if cascade is not used
    await prisma.image.deleteMany({ where: { projectId: id } });

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    return NextResponse.json({ error: "Error deleting project" }, { status: 500 });
  }
}
