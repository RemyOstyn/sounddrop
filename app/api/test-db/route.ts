import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check environment variables
    const dbUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    
    if (!dbUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found in environment variables',
        env_check: {
          DATABASE_URL: !!dbUrl,
          DIRECT_URL: !!directUrl,
          NODE_ENV: process.env.NODE_ENV
        }
      }, { status: 500 });
    }
    
    // Simple database test
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Count categories
    const categoryCount = await prisma.category.count();
    
    return NextResponse.json({
      success: true,
      database_test: result,
      category_count: categoryCount,
      message: 'Database connection successful',
      env_check: {
        DATABASE_URL: !!dbUrl,
        DIRECT_URL: !!directUrl,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Database connection failed',
        details: error,
        env_check: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          DIRECT_URL: !!process.env.DIRECT_URL,
          NODE_ENV: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }
}