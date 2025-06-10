'use client';

import { motion } from 'framer-motion';
import { Heart, Repeat2, MessageSquare } from 'lucide-react';
import { Cast } from '~/types/timeline';
import Image from 'next/image';

interface CastCardProps {
  cast: Cast;
  className?: string;
  onHover?: () => void;
}

export function CastCard({ cast, className = '', onHover }: CastCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}
      whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      onHoverStart={onHover}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-primary/20">
            <Image
              src={cast.avatar}
              alt={cast.username}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-sm">@{cast.username}</p>
            <p className="text-xs text-gray-500">{cast.timestamp}</p>
          </div>
        </div>

        <p className="text-sm mb-3">{cast.content}</p>

        {cast.media && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
            <Image
              src={cast.media.url}
              alt="Cast media"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>{cast.stats.likes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Repeat2 className="h-4 w-4" />
            <span>{cast.stats.recasts}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4" />
            <span>{cast.stats.quotes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 