import { NextResponse } from 'next/server';
import { db, storage } from '~/lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface TimelineData {
  name: string;
  template: string;
  creator: {
    fid: string;
    username: string;
    display_name: string;
    pfp_url: string;
  };
  tags: string[];
  keywords: string[];
  supporterAllocation: string;
  coverImage?: string;
}

interface EngagementData {
  fid: string;
  likes: number;
  recasts: number;
  totalScore: number;
  allocation: number;
}

interface TimelineMetadata {
  name: string;
  description: string;
  image: string;
  properties: {
    category: string;
  };
}

async function fetchCastReactions(castHash: string) {
  const options = {
    method: 'GET',
    headers: {
      'x-api-key': 'C3097677-5CC3-418D-9C95-5F2189C69EC6'
    }
  };

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/reactions/cast/?hash=${castHash}&limit=25&types=all`,
    options
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch reactions for cast ${castHash}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const timelineData: TimelineData = JSON.parse(formData.get('timelineData') as string);
    const coverImage = formData.get('coverImage') as File | null;

    // 1. Fetch casts based on keywords
    const searchQuery = timelineData.keywords
      .map(k => `"${k}"`)
      .join(' | ');
    
    const encodedQuery = encodeURIComponent(searchQuery);
    const castsResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/cast/search/?limit=25&q=${encodedQuery}&author_fid=${timelineData.creator.fid}`,
      {
        headers: {
          'x-api-key': "C3097677-5CC3-418D-9C95-5F2189C69EC6",
          'x-neynar-experimental': 'false'
        }
      }
    );

    if (!castsResponse.ok) {
      throw new Error('Failed to fetch casts');
    }

    const castsData = await castsResponse.json();
    const casts = castsData.result?.casts || [];

    // 2. Calculate engagement and allocations
    const engagementMap = new Map<string, EngagementData>();

    // Fetch reactions for each cast
    for (const cast of casts) {
      try {
        const reactionsData = await fetchCastReactions(cast.hash);
        
        // Process reactions
        for (const reaction of reactionsData.reactions) {
          const fid = reaction.user.fid.toString();
          const current = engagementMap.get(fid) || { fid, likes: 0, recasts: 0, totalScore: 0, allocation: 0 };
          
          if (reaction.reaction_type === 'like') {
            current.likes += 1;
            current.totalScore += 1;
          } else if (reaction.reaction_type === 'recast') {
            current.recasts += 1;
            current.totalScore += 2;
          }
          
          engagementMap.set(fid, current);
        }
      } catch (error) {
        console.error(`Error fetching reactions for cast ${cast.hash}:`, error);
        // Continue with next cast even if one fails
        continue;
      }
    }

    // Calculate total engagement score
    const totalEngagement = Array.from(engagementMap.values()).reduce(
      (sum, data) => sum + data.totalScore,
      0
    );

    // Calculate allocations
    const allocationCap = parseFloat(timelineData.supporterAllocation);
    const supporters = Array.from(engagementMap.values()).map(data => ({
      ...data,
      allocation: totalEngagement > 0 ? (data.totalScore / totalEngagement) * allocationCap : 0
    }));

    // 3. Upload cover image if exists
    let coverImageUrl = '';
    if (coverImage) {
      const storageRef = ref(storage, `timeline-covers/${Date.now()}-${coverImage.name}`);
      const snapshot = await uploadBytes(storageRef, coverImage);
      coverImageUrl = await getDownloadURL(snapshot.ref);
    }

    // Create metadata JSON
    const metadata: TimelineMetadata = {
      name: timelineData.name,
      description: `Farcaster Timeline - ${timelineData.name}`,
      image: coverImageUrl,
      properties: {
        category: "social"
      }
    };

    // Convert metadata to JSON string and create a Blob
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    
    // Upload metadata JSON to Firebase Storage
    const metadataRef = ref(storage, `timeline-metadata/${Date.now()}-${timelineData.name}.json`);
    const metadataSnapshot = await uploadBytes(metadataRef, metadataBlob);
    const metadataUrl = await getDownloadURL(metadataSnapshot.ref);

    // 4. Save timeline to Firestore with metadata URL
    const timelineDoc = {
      name: timelineData.name,
      template: timelineData.template,
      creator: timelineData.creator,
      coverImage: coverImageUrl,
      metadataUrl: metadataUrl,
      tags: timelineData.tags,
      keywords: timelineData.keywords,
      supporterAllocation: timelineData.supporterAllocation,
      castHashes: casts.map((cast: any) => cast.hash),
      createdAt: new Date().toISOString(),
      totalSupporters: supporters.length
    };

    const docRef = await addDoc(collection(db, 'timelines'), timelineDoc);

    // 5. Save supporters in subcollection
    const supportersRef = collection(db, 'timelines', docRef.id, 'supporters');
    for (const supporter of supporters) {
      await setDoc(doc(supportersRef, supporter.fid), {
        likes: supporter.likes,
        recasts: supporter.recasts,
        totalScore: supporter.totalScore,
        allocation: supporter.allocation,
        lastUpdated: new Date().toISOString()
      });
    }

    return NextResponse.json({
      timelineId: docRef.id,
      totalSupporters: supporters.length,
      metadataUrl: metadataUrl
    });
  } catch (error) {
    console.error('Error creating timeline:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline' },
      { status: 500 }
    );
  }
} 