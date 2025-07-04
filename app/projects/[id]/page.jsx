import { prisma } from "../../lib/prisma";

export default async function ProjectDetails({ params }) {
  
  const project = await prisma.project.findUnique({
    where: { id: parseInt(params.id) },
    include: { images: true },
  });
  
  console.log("Found project:", project);

  if (!project) return <div className="pt-36">Project not found.</div>;

  return (
    <div className="pt-36 px-6 max-w-screen-lg mx-auto space-y-4">
      <h1 className="text-4xl font-bold">{project.title}</h1>
      <p className="text-lg text-muted-foreground">{project.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {project.images.map((img) => (
          <img
            key={img.id}
            src={img.url}
            alt={project.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <p><strong>Location:</strong> {project.location}</p>
        <p><strong>Area:</strong> {project.area}</p>
        <p><strong>Type:</strong> {project.type}</p>
        <p><strong>Developer:</strong> {project.developer}</p>
        <p><strong>Bedrooms:</strong> {project.bedrooms}</p>
        <p><strong>Price:</strong> AED {project.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
