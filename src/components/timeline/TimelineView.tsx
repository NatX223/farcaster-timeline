'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PulseThread } from './PulseThread';
import { Snapcast } from './Snapcast';
import { BranchingMemory } from './BranchingMemory';
import { TimelineData } from '~/types/timeline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/input';
import { Dialog } from "@headlessui/react";

// Mock data - replace with actual data fetching
const mockTimelines: Record<string, TimelineData> = {
  '1': {
    id: '1',
    name: 'The Rise of ETH L2s',
    coverImage: '/images/timeline-cover.jpg',
    template: 'pulse-thread',
    tags: ['ethereum', 'l2', 'scaling'],
    keywords: ['#web3', '#ethereum'],
    supporterAllocation: 12,
    casts: [
      {
        id: '1',
        content: 'First cast in the timeline. This is a sample cast to demonstrate the timeline layout.',
        timestamp: '2024-03-20T10:00:00Z',
        username: 'user1',
        avatar: '',
        stats: {
          likes: 42,
          recasts: 12,
          quotes: 5,
        },
      },
      {
        id: '2',
        content: 'Second cast with some interesting content. The timeline continues to unfold...',
        timestamp: '2024-03-20T11:30:00Z',
        username: 'user2',
        avatar: '',
        stats: {
          likes: 28,
          recasts: 8,
          quotes: 3,
        },
      },
      {
        id: '3',
        content: 'Third cast showing how the timeline flows. Each template has its unique way of presenting the story.',
        timestamp: '2024-03-20T13:15:00Z',
        username: 'user3',
        avatar: '',
        stats: {
          likes: 35,
          recasts: 15,
          quotes: 7,
        },
      },
    ],
    creator: {
      fid: '1',
      username: 'natx223',
      avatar: '',
    },
  },
  '2': {
    id: '2',
    name: 'Web3 Gaming Evolution',
    coverImage: '/images/timeline-cover.jpg',
    template: 'snapcast',
    tags: ['gaming', 'web3', 'nft'],
    keywords: ['#web3gaming', '#nft'],
    supporterAllocation: 15,
    casts: [
      {
        id: '1',
        content: 'The beginning of Web3 gaming...',
        timestamp: '2024-03-19T10:00:00Z',
        username: 'gamer1',
        avatar: '',
        stats: {
          likes: 56,
          recasts: 23,
          quotes: 12,
        },
      },
      {
        id: '2',
        content: 'Major milestones in blockchain gaming...',
        timestamp: '2024-03-19T11:30:00Z',
        username: 'gamer2',
        avatar: '',
        stats: {
          likes: 78,
          recasts: 34,
          quotes: 15,
        },
      },
    ],
    creator: {
      fid: '2',
      username: 'web3gamer',
      avatar: '',
    },
  },
};

interface TimelineViewProps {
  timelineId: string;
}

export function TimelineView({ timelineId }: TimelineViewProps) {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const { scrollY } = useScroll();
  const coverHeight = useTransform(scrollY, [0, 300], [300, 200]);

  // Get timeline data based on ID
  const timeline = mockTimelines[timelineId];

  // If timeline not found, show error state
  if (!timeline) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-clash mb-2">Timeline Not Found</h1>
          <p className="text-gray-600">The timeline you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Mock stats - replace with actual data
  const stats = {
    allocation: `${timeline.supporterAllocation}%`,
    earnings: 'Ξ 0.32',
    marketCap: '$9,210.45',
  };

  const getTemplateComponent = () => {
    switch (timeline.template) {
      case 'pulse-thread':
        return <PulseThread timeline={timeline} />;
      case 'snapcast':
        return <Snapcast timeline={timeline} />;
      case 'branching-memory':
        return <BranchingMemory timeline={timeline} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 overflow-hidden">
              <img src={timeline.creator.avatar} alt={timeline.creator.username} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-medium">@{timeline.creator.username}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Section */}
      <motion.section
        style={{ height: coverHeight }}
        className="relative w-full overflow-hidden"
      >
        <img
          src={timeline.coverImage}
          alt={timeline.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
          <h1 className="text-4xl font-bold font-clash text-white drop-shadow-lg">
            {timeline.name}
          </h1>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {getTemplateComponent()}
            </div>
          </div>

          {/* Stats and Exchange Panel */}
          <div className="space-y-6">
            {/* Stats Panel */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-primary/20">
                <span className="text-gray-600">Supporter Allocation</span>
                <span className="font-semibold">{stats.allocation}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-primary/20">
                <span className="text-gray-600">Earnings</span>
                <span className="font-semibold">{stats.earnings}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-primary/20">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-semibold">{stats.marketCap}</span>
              </div>
            </div>

            {/* Exchange Panel (Desktop) */}
            <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-primary/20">
              <h3 className="text-lg font-semibold mb-4">Trade Timeline</h3>
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="primary" className="w-full">Buy</Button>
                  <Button variant="secondary" className="w-full">Sell</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Exchange Button */}
      <button
        onClick={() => setIsExchangeOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden bg-primary text-white rounded-full px-6 py-3 shadow-lg"
      >
        Trade
      </button>

      {/* Mobile Exchange Modal */}
      <Dialog
        open={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-end justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-t-xl p-6">
            <Dialog.Title className="text-lg font-semibold mb-4">Trade Timeline</Dialog.Title>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Button variant="primary" className="w-full">Buy</Button>
                <Button variant="secondary" className="w-full">Sell</Button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 