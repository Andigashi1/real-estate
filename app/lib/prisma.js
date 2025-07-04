import { PrismaClient } from '@prisma/client';

// Create and export Prisma client instance
const prisma = new PrismaClient();

export { prisma };