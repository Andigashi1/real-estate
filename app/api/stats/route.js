// App Router version (app/api/stats/route.js)
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get project count
    const projectCount = await prisma.project.count();
    
    // Get unique developer count
    const developers = await prisma.project.findMany({
      select: { developer: true },
    });
    const companyCount = new Set(developers.map(p => p.developer).filter(Boolean)).size;
    
    // Get unique location count
    const locations = await prisma.project.findMany({
      select: { location: true },
    });
    const locationCount = new Set(locations.map(p => p.location).filter(Boolean)).size;
    
    // Get price range using minPrice and maxPrice from projects
    const projects = await prisma.project.findMany({
      select: { 
        minPrice: true, 
        maxPrice: true 
      },
    });
    
    const allPrices = [];
    projects.forEach(project => {
      if (project.minPrice) allPrices.push(project.minPrice);
      if (project.maxPrice) allPrices.push(project.maxPrice);
    });
    
    const overallMinPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
    const overallMaxPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;
    
    const formatPrice = (price) => {
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)}M`;
      } else if (price >= 1000) {
        return `${(price / 1000).toFixed(0)}K`;
      }
      return price?.toString();
    };
    
    const priceRange = overallMinPrice && overallMaxPrice
      ? `${formatPrice(overallMinPrice)}-${formatPrice(overallMaxPrice)} AED`
      : 'N/A';
    
    return NextResponse.json({
      projectCount,
      companyCount,
      locationCount,
      priceRange,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}