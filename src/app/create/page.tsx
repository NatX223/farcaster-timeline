import { Metadata } from 'next';
import { CreateTimeline } from '~/components/CreateTimeline';
import { APP_NAME, APP_DESCRIPTION } from '~/lib/constants';

export const metadata: Metadata = {
  title: `Create Timeline - ${APP_NAME}`,
  description: APP_DESCRIPTION,
};

export default function CreatePage() {
  return <CreateTimeline />;
} 