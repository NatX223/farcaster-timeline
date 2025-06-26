'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PulseThread } from './PulseThread';
import { Snapcast } from './Snapcast';
import { BranchingMemory } from './BranchingMemory';
import { TimelineData } from '~/types/timeline';
import { Cast } from '~/types/timeline';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/input';
import { Dialog } from "@headlessui/react";
import { db } from '~/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAccount } from 'wagmi';

interface TimelineViewProps {
  timelineId: string;
}

export function TimelineView({ timelineId }: TimelineViewProps) {
  const [timeline, setTimeline] = useState<any>(null);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [stats, setStats] = useState({
    allocation: '0%',
    earnings: 'Ξ 0',
    marketCap: '$0',
    balance: '0'
  });
  const { scrollY } = useScroll();
  const coverHeight = useTransform(scrollY, [0, 300], [300, 200]);
  const { address } = useAccount();

  useEffect(() => {
    async function fetchTimelineAndCasts() {
      setLoading(true);
      try {
        // Fetch timeline doc
        const timelineRef = doc(db, 'timelines', timelineId);
        const timelineSnap = await getDoc(timelineRef);
        if (!timelineSnap.exists()) {
          setTimeline(null);
          setLoading(false);
          return;
        }
        const timelineData = timelineSnap.data();
        setTimeline({ ...timelineData, id: timelineId });

        // Fetch casts from our API endpoint
        const res = await fetch(`/api/timelines/${timelineId}/casts`);
        if (!res.ok) {
          throw new Error('Failed to fetch casts');
        }
        const data = await res.json();
        setCasts(data.casts);
      } catch (error) {
        console.error('Error fetching timeline and casts:', error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    }
    fetchTimelineAndCasts();
  }, [timelineId]);

  // Fetch user stats when timeline and user address are available
  useEffect(() => {
    async function fetchUserStats() {
      if (!timeline || !address || !timeline.rewardManager || !timeline.coinAddress) {
        return;
      }

      try {
        const response = await fetch(
          `/api/timelines/${timelineId}/user-stats?userAddress=${address}&rewardManager=${timeline.rewardManager}&coinAddress=${timeline.coinAddress}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            allocation: data.supporterAllocation,
            earnings: `Ξ ${data.earnings.toFixed(4)}`,
            marketCap: `$${data.marketCap.toLocaleString()}`,
            balance: data.balance.toFixed(4)
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    }

    fetchUserStats();
  }, [timeline, address, timelineId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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

  // Replace getTemplateComponent with template switch and pass casts to timeline
  const getTemplateComponent = () => {
    const timelineWithCasts = { ...timeline, casts };
    switch (timeline.template) {
      case 'pulse-thread':
        return <PulseThread timeline={timelineWithCasts} />;
      case 'snapcast':
        return <Snapcast timeline={timelineWithCasts} />;
      case 'branching-memory':
        return <BranchingMemory timeline={timelineWithCasts} />;
      default:
        // fallback: show a simple list with media
        return (
          <div className="space-y-6">
            {casts.map((cast) => (
              <div key={cast.hash} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-2">
                  <img
                    src={timeline.creator?.pfp_url || ''}
                    alt={timeline.creator?.username || ''}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <span className="font-medium">{timeline.creator?.display_name || ''}</span>
                    <span className="text-gray-500 ml-2">@{timeline.creator?.username || ''}</span>
                    <span className="text-gray-400 text-sm ml-2">{new Date(cast.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="mb-2 text-gray-700">{cast.text}</p>
                {cast.media && cast.media.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cast.media.map((media, idx) => (
                      media.type.startsWith('image') ? (
                        <img key={idx} src={media.url} alt="cast media" className="max-w-xs rounded-lg" />
                      ) : media.type.startsWith('video') ? (
                        <video key={idx} src={media.url} controls className="max-w-xs rounded-lg" />
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 overflow-hidden">
              <img src={timeline.creator?.pfp_url || ''} alt={timeline.creator?.username || ''} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-medium">@{timeline.creator?.username || ''}</p>
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
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-primary/20">
                <span className="text-gray-600">Your Balance</span>
                <span className="font-semibold">{stats.balance}</span>
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