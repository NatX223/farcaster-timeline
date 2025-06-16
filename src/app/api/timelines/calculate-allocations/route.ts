import { NextResponse } from 'next/server';
import { db } from '~/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

interface Cast {
  hash: string;
  text: string;
  timestamp: string;
  author: {
    username: string;
    display_name: string;
    pfp_url: string;
  };
  embeds: Array<{
    url: string;
    metadata?: {
      image?: {
        width_px: number;
        height_px: number;
      };
    };
  }>;
}

interface EngagementData {
  fid: string;
  likes: number;
  recasts: number;
  totalScore: number;
  allocation: number;
}

export async function POST(request: Request) {
  try {
    const { casts, supporterAllocation } = await request.json();

    // Fetch engagement data for each cast
    const engagementMap = new Map<string, EngagementData>();

    for (const cast of casts) {
      // Fetch likes
      const likesResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/cast/likes?cast_hash=${cast.hash}`,
        {
          headers: {
            'x-api-key': process.env.NEYNAR_API_KEY || '',
            'x-neynar-experimental': 'false'
          }
        }
      );
      const likesData = await likesResponse.json();

      // Fetch recasts
      const recastsResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/cast/recasts?cast_hash=${cast.hash}`,
        {
          headers: {
            'x-api-key': process.env.NEYNAR_API_KEY || '',
            'x-neynar-experimental': 'false'
          }
        }
      );
      const recastsData = await recastsResponse.json();

      // Process likes
      if (likesData.result?.likes) {
        for (const like of likesData.result.likes) {
          const fid = like.user.fid.toString();
          const current = engagementMap.get(fid) || { fid, likes: 0, recasts: 0, totalScore: 0, allocation: 0 };
          current.likes += 1;
          current.totalScore += 1;
          engagementMap.set(fid, current);
        }
      }

      // Process recasts
      if (recastsData.result?.recasts) {
        for (const recast of recastsData.result.recasts) {
          const fid = recast.user.fid.toString();
          const current = engagementMap.get(fid) || { fid, likes: 0, recasts: 0, totalScore: 0, allocation: 0 };
          current.recasts += 1;
          current.totalScore += 2;
          engagementMap.set(fid, current);
        }
      }
    }

    // Calculate total engagement score
    const totalEngagement = Array.from(engagementMap.values()).reduce(
      (sum, data) => sum + data.totalScore,
      0
    );

    // Calculate allocations
    const allocationCap = parseFloat(supporterAllocation);
    const supporters = Array.from(engagementMap.values()).map(data => ({
      ...data,
      allocation: (data.totalScore / totalEngagement) * allocationCap
    }));

    return NextResponse.json({ supporters });
  } catch (error) {
    console.error('Error calculating allocations:', error);
    return NextResponse.json(
      { error: 'Failed to calculate allocations' },
      { status: 500 }
    );
  }
} 