'use client';

import { useCallback, useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Star, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from "~/components/ui/Button";
import { Timeline } from "~/components/icons/Timeline";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useFrame } from "~/components/providers/FrameProvider";
import { truncateAddress } from "~/lib/truncateAddress";
import Link from 'next/link';

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isSDKLoaded, context } = useFrame();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleConnect = useCallback((connector: any) => {
    connect({ connector });
    setIsDropdownOpen(false);
  }, [connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsDropdownOpen(false);
  }, [disconnect]);

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
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-text hover:text-primary transition-colors">How It Works</a>
              <a href="#explore" className="text-text hover:text-primary transition-colors">Explore</a>
              <a href="#create" className="text-text hover:text-primary transition-colors">Create</a>
              
              {/* Wallet Connect Button with Dropdown */}
              <div className="wallet-dropdown relative">
                <Button 
                  variant={isConnected ? "secondary" : "primary"}
                  className="!w-auto !max-w-none flex items-center gap-2"
                  onClick={() => isConnected ? handleDisconnect() : setIsDropdownOpen(!isDropdownOpen)}
                >
                  {isConnected ? (
                    <>
                      {address ? truncateAddress(address) : 'Unknown'}
                      <ChevronDown className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Connect
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Dropdown Menu */}
                {isDropdownOpen && !isConnected && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-2 z-50">
                    {context ? (
                      <Button
                        variant="outline"
                        className="!w-full !max-w-none rounded-none border-0 hover:bg-gray-50"
                        onClick={() => handleConnect(connectors[0])}
                      >
                        Connect Frame
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="!w-full !max-w-none rounded-none border-0 hover:bg-gray-50"
                          onClick={() => handleConnect(connectors[1])}
                        >
                          Connect Coinbase Wallet
                        </Button>
                        <Button
                          variant="outline"
                          className="!w-full !max-w-none rounded-none border-0 hover:bg-gray-50"
                          onClick={() => handleConnect(connectors[2])}
                        >
                          Connect MetaMask
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
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
                Your Story. <span className="text-primary">Tokenized.</span>
              </h1>
              <p className="text-xl font-clash text-gray-600">
                Create beautiful timelines from your casts and let the community support and earn with you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Create
                </button>
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
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent2/20 rounded-xl p-4">
                {/* Timeline Preview Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => window.location.href = `/timeline/${index + 1}`}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent2/10" />
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20" />
                    <div>
                      <h3 className="font-semibold font-clash">Creator Name</h3>
                      <p className="text-sm text-gray-500 font-clash">Timeline Title</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['AI', 'Zora', 'Farcaster'].map((tag) => (
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
                      Support
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
    </main>
  );
} 