'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PulseThread } from './PulseThread';
import { Snapcast } from './Snapcast';
import { BranchingMemory } from './BranchingMemory';
import { TimelineTemplate } from '~/types/timeline';

const sampleTimeline = {
  id: '1',
  name: 'Sample Timeline',
  coverImage: '',
  template: 'pulse-thread' as TimelineTemplate,
  tags: ['sample', 'demo'],
  keywords: ['#web3', '#farcaster'],
  supporterAllocation: 10,
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
    username: 'creator',
    avatar: '',
  },
};

export function TemplateShowcase() {
  const [selectedTemplate, setSelectedTemplate] = useState<TimelineTemplate>('pulse-thread');

  const templates: TimelineTemplate[] = ['pulse-thread', 'snapcast', 'branching-memory'];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-clash mb-4">Timeline Templates</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our collection of beautifully designed timeline templates. Each template offers a unique way to tell your story.
          </p>
        </div>

        {/* Template Navigation */}
        <div className="flex justify-center space-x-4 mb-8">
          {templates.map((template) => (
            <button
              key={template}
              onClick={() => setSelectedTemplate(template)}
              className={`px-6 py-2 rounded-full transition-colors ${
                selectedTemplate === template
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {template.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Template Preview */}
        <motion.div
          key={selectedTemplate}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-clash mb-2">
              {selectedTemplate.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h2>
            <p className="text-gray-600">
              {selectedTemplate === 'pulse-thread' && 'A vertical timeline that alternates between left and right, perfect for chronological storytelling.'}
              {selectedTemplate === 'snapcast' && 'A horizontal timeline that spreads casts evenly, great for parallel events or comparisons.'}
              {selectedTemplate === 'branching-memory' && 'A tree-like structure that shows relationships between events, ideal for complex narratives.'}
            </p>
          </div>

          <div className="border rounded-lg p-8">
            {selectedTemplate === 'pulse-thread' && <PulseThread timeline={sampleTimeline} />}
            {selectedTemplate === 'snapcast' && <Snapcast timeline={sampleTimeline} />}
            {selectedTemplate === 'branching-memory' && <BranchingMemory timeline={sampleTimeline} />}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 