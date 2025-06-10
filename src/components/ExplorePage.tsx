'use client';

import { motion } from 'framer-motion';
import { Button } from '~/components/ui/Button';
import { useState } from 'react';

interface Timeline {
  id: string;
  title: string;
  description: string;
  creator: {
    username: string;
    avatarUrl: string;
  };
  supporters: number;
  coverImage?: string;
}

// Mock data for demonstration
const mockTimelines: Timeline[] = [
  {
    id: '1',
    title: 'My Journey in Web3',
    description: 'A collection of key moments and learnings from my web3 journey, from first NFT to building dApps.',
    creator: {
      username: 'alice',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
    supporters: 42,
  },
  {
    id: '2',
    title: 'DeFi Evolution',
    description: 'Tracking the evolution of DeFi protocols and their impact on the financial landscape.',
    creator: {
      username: 'bob',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    },
    supporters: 28,
  },
  {
    id: '3',
    title: 'NFT Art Collection',
    description: 'A curated timeline of my favorite NFT art pieces and the stories behind them.',
    creator: {
      username: 'carol',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
    },
    supporters: 56,
  },
];

export function ExplorePage() {
  const [timelines, setTimelines] = useState<Timeline[]>(mockTimelines);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Generate new timelines with unique IDs
      const newTimelines = mockTimelines.map((timeline, index) => ({
        ...timeline,
        id: `${timeline.id}-${timelines.length + index + 1}`,
        supporters: Math.floor(Math.random() * 100) + 1, // Random supporters for variety
      }));
      setTimelines([...timelines, ...newTimelines]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold font-clash text-gray-800 mb-2">Explore Timelines</h1>
          <p className="text-lg text-gray-600">
            Discover curated moments by Farcaster creators – beautifully arranged, tokenized, and ready to explore.
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {timelines.map((timeline, index) => (
            <motion.a
              key={timeline.id}
              href={`/timeline/${timeline.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="block bg-white shadow-md rounded-2xl overflow-hidden border hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {timeline.coverImage ? (
                  <img
                    src={timeline.coverImage}
                    alt={timeline.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">Timeline Preview</p>
                )}
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-xl font-semibold font-clash text-gray-800">{timeline.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{timeline.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={timeline.creator.avatarUrl}
                      alt={timeline.creator.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-700">@{timeline.creator.username}</span>
                  </div>
                  <span className="text-xs text-gray-500">🌟 {timeline.supporters} supporters</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-10">
          <Button
            variant="primary"
            onClick={handleLoadMore}
            isLoading={isLoading}
            className="!w-auto !max-w-none"
          >
            Load More
          </Button>
        </div>
      </div>
    </div>
  );
} 