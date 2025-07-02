'use client';

import { motion } from 'framer-motion';
import { Button } from '~/components/ui/Button';
import { Star, Sparkles, ChevronDown, Users, ArrowLeftIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Step {
  title: string;
  description: string;
  icon: ReactNode;
}

const steps: Step[] = [
  {
    title: 'Connect Your Farcaster',
    description: 'Login and connect your Farcaster account. We\'ll auto-fetch your casts.',
    icon: <Star className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Curate a Timeline',
    description: 'Select and arrange casts that tell a story, moment, or idea. Each one forms a step in the visual timeline.',
    icon: <Sparkles className="h-6 w-6 text-accent1" />,
  },
  {
    title: 'Coin Your Timeline',
    description: 'Launch your timeline as a collectible or supportable token. Add a title, cover, and mint settings.',
    icon: <ChevronDown className="h-6 w-6 text-accent2" />,
  },
  {
    title: 'Reward Supporters',
    description: 'We use AI to detect positive engagement (e.g., comments, tags). The most supportive users earn part of the proceeds.',
    icon: <Users className="h-6 w-6 text-primary" />,
  },
];

export function HowItWorks() {
  const router = useRouter();
  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-16">
      <ArrowLeftIcon className="w-7 h-7 text-primary absolute top-6 left-6 cursor-pointer" onClick={() => router.back()} />
        {/* Page Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold font-clash text-gray-800 mb-4">How It Works</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Build beautiful timelines from your casts, tokenize them, and share value with your most loyal supporters.
          </p>
        </motion.div>

        {/* Steps Section */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col md:flex-row items-start md:items-center gap-4 p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                {step.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold font-clash text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <h2 className="text-2xl font-semibold font-clash text-gray-800 mb-4">Ready to create your timeline?</h2>
          <Button variant="primary" className="!w-auto !max-w-none">
            Create Timeline
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 