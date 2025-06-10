'use client';

import { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useSession } from 'next-auth/react';
import { signIn, getCsrfToken } from 'next-auth/react';
import sdk from '@farcaster/frame-sdk';
import { HelpCircle, X, Check, Image, Info } from 'lucide-react';
import { Tooltip } from '~/components/ui/tooltip';
import { TemplatePreview } from './timeline/TemplatePreview';
import { TimelineTemplate } from '~/types/timeline';
import dotenv from 'dotenv';

dotenv.config();
interface Tag {
  id: string;
  text: string;
}

interface UserProfile {
  username: string;
  display_name: string;
  pfp_url: string;
}

export function CreateTimeline() {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [timelineName, setTimelineName] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [keywords, setKeywords] = useState<Tag[]>([]);
  const [supporterAllocation, setSupporterAllocation] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  // Fetch user profile when session is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.fid) return;

      try {
        const apiKey = process.env.NEYNAR_API_KEY;
        console.log('API Key available:', !!apiKey);

        const options = {
          method: 'GET',
          headers: {
            'x-neynar-experimental': 'false',
            'x-api-key': "6748D570-BEE9-4713-AADD-FBB2CBDA25A1"
          }
        };

        console.log('Fetching user profile for FID:', session.user.fid);
        const response = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${session.user.fid}`,
          options
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response:', errorText);
          throw new Error(`Failed to fetch user profile: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        if (data.users && data.users.length > 0) {
          const user = data.users[0];
          console.log(user);
          
          setUserProfile({
            username: user.username || '',
            display_name: user.display_name || '',
            pfp_url: user.pfp_url || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [session, status]);

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
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, []);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'tags' | 'keywords') => {
    if ((e.key === ' ' || e.key === 'Enter') && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = {
        id: Math.random().toString(36).substr(2, 9),
        text: e.currentTarget.value.trim()
      };
      
      if (type === 'tags') {
        setTags([...tags, newTag]);
        setTagInput('');
      } else {
        setKeywords([...keywords, newTag]);
        setKeywordInput('');
      }
    }
  };

  const removeTag = (id: string, type: 'tags' | 'keywords') => {
    if (type === 'tags') {
      setTags(tags.filter(tag => tag.id !== id));
    } else {
      setKeywords(keywords.filter(keyword => keyword.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          {/* Farcaster Connect Section */}
          {status !== "authenticated" ? (
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold font-clash">Connect your Farcaster Account</h2>
              <p className="text-gray-600">To create a timeline, please connect your Farcaster account.</p>
              <Button onClick={handleSignIn} variant="primary" className="!w-auto">
                Connect Farcaster
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-8">
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
            </div>
          )}

          {/* Cover Image Upload */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="cover-image">Cover Image</Label>
            <div className="flex flex-col items-center">
              <label
                htmlFor="cover-image"
                className={`relative w-full md:w-1/2 aspect-[16/9] rounded-xl border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center ${
                  coverPreview ? 'bg-transparent' : 'bg-gray-50'
                }`}
              >
                {coverPreview ? (
                  <div className="w-full h-full rounded-xl overflow-hidden">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Image className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload cover image</span>
                  </div>
                )}
                <input
                  id="cover-image"
                  type="file"
                  accept=".png,.jpeg,.jpg,.gif"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Timeline Name */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="timeline-name">Timeline Name</Label>
            <Input
              id="timeline-name"
              placeholder="e.g. My 2024 Reflections"
              value={timelineName}
              onChange={(e) => setTimelineName(e.target.value)}
            />
          </div>

          {/* Tags Input */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="tags">Tags</Label>
            <div className="space-y-2">
              <Input
                id="tags"
                placeholder="Type and press space to add tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => handleTagInputKeyDown(e, 'tags')}
              />
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-sm"
                  >
                    {tag.text}
                    <button
                      onClick={() => removeTag(tag.id, 'tags')}
                      className="ml-2 hover:bg-primary/80 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords Input */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Tooltip content="Keywords/hashtags contained in your casts that will be curated and used in creating this timeline">
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </Tooltip>
            </div>
            <div className="space-y-2">
              <Input
                id="keywords"
                placeholder="Type and press space to add keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => handleTagInputKeyDown(e, 'keywords')}
              />
              <div className="flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <span
                    key={keyword.id}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-sm"
                  >
                    {keyword.text}
                    <button
                      onClick={() => removeTag(keyword.id, 'keywords')}
                      className="ml-2 hover:bg-primary/80 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Supporter Allocation */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2">
              <Label htmlFor="allocation">Supporter Allocation</Label>
              <Tooltip content="This is the allocation of trading fees not allocation of tokens">
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </Tooltip>
            </div>
            <div className="relative">
              <Input
                id="allocation"
                type="number"
                min="0"
                max="50"
                value={supporterAllocation}
                onChange={(e) => setSupporterAllocation(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="template">Template</Label>
              <Tooltip content="Choose a layout style for your timeline">
                <Info className="h-4 w-4 text-gray-400" />
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {['pulse-thread', 'snapcast', 'branching-memory'].map((template) => (
                <TemplatePreview
                  key={template}
                  template={template as TimelineTemplate}
                  isSelected={selectedTemplate === template}
                  onSelect={(template) => setSelectedTemplate(template)}
                />
              ))}
            </div>
          </div>

          {/* Create Button */}
          <Button
            variant="primary"
            className="w-full"
            disabled={!session || !timelineName || !selectedTemplate}
          >
            Create Timeline
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 