import { prisma } from './prisma'; // Adjust path as needed

// Create a new project
export const createProject = async (data) => {
  try {
    const project = await prisma.project.create({
      data,
    });
    return project;
  } catch (error) {
    throw new Error('Failed to create project: ' + error.message);
  }
};

// Get all projects
export const getAllProjects = async () => {
  try {
    const projects = await prisma.project.findMany({
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
    return projects;
  } catch (error) {
    throw new Error('Failed to fetch projects: ' + error.message);
  }
};

// Get a single project by slug
export const getProjectBySlug = async (slug) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: { images: true },
    });
    return project;
  } catch (error) {
    throw new Error('Failed to fetch project: ' + error.message);
  }
};

// Update a project
export const updateProject = async (slug, data) => {
  try {
    const project = await prisma.project.update({
      where: { slug },
      data,
    });
    return project;
  } catch (error) {
    throw new Error('Failed to update project: ' + error.message);
  }
};

// Delete a project
export const deleteProject = async (slug) => {
  try {
    const project = await prisma.project.delete({
      where: { slug },
    });
    return project;
  } catch (error) {
    throw new Error('Failed to delete project: ' + error.message);
  }
};
