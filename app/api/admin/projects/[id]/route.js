import { prisma } from "@/app/lib/prisma";

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const body = await req.json();

    // Convert numeric values to floats to avoid type mismatch
    const unitTypes = body.unitTypes.map((unitType) => ({
      where: { id: unitType.id },
      data: {
        bedrooms: unitType.bedrooms,
        minPrice: parseFloat(unitType.minPrice), // Ensure minPrice is a float
        maxPrice: parseFloat(unitType.maxPrice), // Ensure maxPrice is a float
        minArea: parseFloat(unitType.minArea),   // Ensure minArea is a float
        maxArea: parseFloat(unitType.maxArea),   // Ensure maxArea is a float
      },
    }));

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        location: body.location,
        type: body.type,
        developer: body.developer,
        furnished: body.furnished,
        newLaunch: body.newLaunch,
        unitTypes: {
          update: unitTypes,
        },
      },
    });

    return new Response(JSON.stringify(updatedProject), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to update project", { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("Failed to delete project:", error);
    return new Response("Failed to delete project", { status: 500 });
  }
}
