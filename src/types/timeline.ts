export interface Cast {
  id: string;
  content: string;
  timestamp: string;
  username: string;
  avatar: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  stats: {
    likes: number;
    quotes: number;
    recasts: number;
  };
}

export type TimelineTemplate = 'pulse-thread' | 'snapcast' | 'branching-memory';

export interface TimelineData {
  id: string;
  name: string;
  coverImage: string;
  template: TimelineTemplate;
  tags: string[];
  keywords: string[];
  supporterAllocation: number;
  casts: Cast[];
  creator: {
    fid: string;
    username: string;
    avatar: string;
  };
} 