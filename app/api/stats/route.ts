import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all stats in parallel
    const [totalSamples, totalLibraries, totalUsers, recentSamples] = await Promise.all([
      prisma.sample.count({
        where: {
          library: {
            isPublic: true
          }
        }
      }),
      prisma.library.count({
        where: {
          isPublic: true
        }
      }),
      prisma.user.count(),
      prisma.sample.count({
        where: {
          library: {
            isPublic: true
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    // Format numbers for display
    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return num.toString();
    };

    return NextResponse.json({
      totalSamples: formatNumber(totalSamples),
      totalLibraries: formatNumber(totalLibraries), 
      totalUsers: formatNumber(totalUsers),
      recentSamples: formatNumber(recentSamples),
      raw: {
        totalSamples,
        totalLibraries,
        totalUsers,
        recentSamples
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}