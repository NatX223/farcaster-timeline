'use client';

import { useCallback, useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Star, Sparkles, Circle } from 'lucide-react';
import { Button } from "~/components/ui/Button";
import { Timeline } from "~/components/icons/Timeline";
import { useSession } from 'next-auth/react';
import { signIn, getCsrfToken } from 'next-auth/react';
import sdk from '@farcaster/frame-sdk';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useFrame } from "~/components/providers/FrameProvider";
import Link from 'next/link';
import { useUserProfile } from '~/components/providers/UserProfileContext';
import { db } from '~/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import AnimatedTimelineHeroVisual from '~/components/AnimatedTimelineHeroVisual';

interface UserProfile {
  username: string;
  display_name: string;
  pfp_url: string;
  fid: string;
}

export function LandingPage() {
  const { data: session, status } = useSession();
  const { userProfile, setUserProfile } = useUserProfile();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { isSDKLoaded, context } = useFrame();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [featuredTimelines, setFeaturedTimelines] = useState<any[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Fetch user profile when session is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.fid) return;

      try {
        const response = await fetch(`/api/user-profile?fid=${session.user.fid}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response:', errorText);
          throw new Error(`Failed to fetch user profile: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        if (data.user) {
          setUserProfile({
            username: data.user.username || '',
            display_name: data.user.display_name || '',
            pfp_url: data.user.pfp_url || '',
            fid: session.user.fid,
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [session, status, setUserProfile]);

  const handleSignIn = useCallback(async () => {
    try {
      const nonce = await getCsrfToken();
      if (!nonce) throw new Error("Unable to generate nonce");
      
      const result = await sdk.actions.signIn({ nonce });
      await signIn("credentials", {
        message: result.message,
        signature: result.signature,
        redirect: false,
      });
      // Instead of connecting directly, show wallet modal
      setShowWalletModal(true);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, [connect, connectors]);

  const handleWalletSelect = (index: number) => {
    if (connectors[index]) {
      connect({ connector: connectors[index] });
      setShowWalletModal(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.wallet-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchFeaturedTimelines() {
      setIsFeaturedLoading(true);
      // Get the 3 latest timelines by createdAt
      const q = query(collection(db, 'timelines'), orderBy('createdAt', 'desc'), limit(3));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.name,
          creator: {
            username: d.creator?.username || '',
            avatarUrl: d.creator?.pfp_url || '',
          },
          tags: d.tags || [],
          coverImage: d.coverImage || '',
        };
      });
      setFeaturedTimelines(data);
      setIsFeaturedLoading(false);
    }
    fetchFeaturedTimelines();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold font-clash text-text">Timeline</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex space-x-8">
                <a href="#how-it-works" className="text-text hover:text-primary transition-colors">How It Works</a>
                <a href="#explore" className="text-text hover:text-primary transition-colors">Explore</a>
                <a href="#create" className="text-text hover:text-primary transition-colors">Create</a>
              </div>
              
              {/* Wallet Connect Button with Dropdown */}
              {status !== "authenticated" ? (
                <Button onClick={handleSignIn} variant="primary" className="!w-auto">
                  Connect
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    {userProfile?.pfp_url ? (
                      <img 
                        src={userProfile.pfp_url} 
                        alt={userProfile.display_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {userProfile?.display_name || 'Loading...'}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{userProfile?.username || session?.user?.fid}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Circle 
                      className={`h-2 w-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`} 
                      fill={isConnected ? 'currentColor' : 'currentColor'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <h1 className="text-5xl font-bold font-clash text-text leading-tight">
                Your Story. <br /> <span className="text-primary">Tokenized.</span>
              </h1>
              <p className="text-xl font-clash text-gray-600">
                Create beautiful timelines from your casts and let the community support and earn with you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/create" className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center">
                  Create
                </Link>
                <Link href="/explore" className="px-8 py-3 border-2 border-accent2 text-accent2 rounded-lg hover:bg-accent2/10 transition-colors text-center">
                  Explore
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent2/10 rounded-xl p-4 flex items-center justify-center">
                <img src="/Scene-1.gif" alt="Timeline Animation" className="max-h-72 w-auto mx-auto rounded-lg shadow-lg" />
              </div>
              <p className="text-center mt-4 text-sm text-gray-500">
                Powered by Zora · Farcaster
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-clash text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: 'Connect Farcaster',
                description: 'Import your casts automatically',
                icon: <Star className="h-8 w-8 text-primary" />
              },
              {
                title: 'Curate Your Timeline',
                description: 'Select key moments',
                icon: <Timeline className="h-8 w-8 text-accent1" />
              },
              {
                title: 'Tokenize It',
                description: 'Launch as a collectible or rewardable token',
                icon: <Sparkles className="h-8 w-8 text-accent2" />
              },
              {
                title: 'Support & Share',
                description: 'Supporters receive proceeds based on their engagement',
                icon: <Star className="h-8 w-8 text-primary" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-background"
              >
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold font-clash mb-2">{step.title}</h3>
                <p className="text-gray-600 font-clash">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Timelines Section */}
      <section id="explore" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-clash text-center mb-12">Featured Timelines</h2>
          {isFeaturedLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTimelines.map((timeline, index) => (
                <motion.div
                  key={timeline.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => window.location.href = `/timeline/${timeline.id}`}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent2/10 flex items-center justify-center">
                    {timeline.coverImage ? (
                      <img src={timeline.coverImage} alt={timeline.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 overflow-hidden">
                        {timeline.creator.avatarUrl ? (
                          <img src={timeline.creator.avatarUrl} alt={timeline.creator.username} className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <h3 className="font-semibold font-clash">@{timeline.creator.username}</h3>
                        <p className="text-sm text-gray-500 font-clash">{timeline.title}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {timeline.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-background rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <button 
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add support functionality here
                        }}
                      >
                        Trade
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link href="/explore" className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              View More Timelines
            </Link>
          </div>
        </div>
      </section>

      {/* Why Coin Your Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-clash text-center mb-12">Why Coin Your Timeline?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-semibold font-clash text-primary">For Creators</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Star className="h-6 w-6 text-accent1 flex-shrink-0 mt-1" />
                  <span>Generate income from your content</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Star className="h-6 w-6 text-accent1 flex-shrink-0 mt-1" />
                  <span>Increase visibility and reach</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Star className="h-6 w-6 text-accent1 flex-shrink-0 mt-1" />
                  <span>Get proper attribution for your work</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-semibold font-clash text-accent2">For Supporters</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Star className="h-6 w-6 text-accent2 flex-shrink-0 mt-1" />
                  <span>Get rewarded for positive engagement</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Star className="h-6 w-6 text-accent2 flex-shrink-0 mt-1" />
                  <span>Support creators you believe in</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Star className="h-6 w-6 text-accent2 flex-shrink-0 mt-1" />
                  <span>Earn through AI-powered rewards</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs text-center relative">
            <h2 className="text-lg font-bold mb-4">Choose a Wallet</h2>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowWalletModal(false)}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="space-y-4">
              <Button className="w-full" variant="secondary" onClick={() => handleWalletSelect(0)}>
                Farcaster Wallet
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => handleWalletSelect(1)}>
                Coinbase Wallet
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => handleWalletSelect(2)}>
                MetaMask
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 