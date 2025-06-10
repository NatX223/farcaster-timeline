import { Metadata } from 'next';
import { TimelineView } from '~/components/timeline/TimelineView';
import { APP_NAME, APP_DESCRIPTION } from '~/lib/constants';

export const metadata: Metadata = {
  title: `Timeline | ${APP_NAME}`,
  description: APP_DESCRIPTION,
};

export default async function TimelinePage({ params }: { params: { id: string } }) {
  // Here you would typically fetch the timeline data using the ID
  // For now, we'll just pass the ID to the component
  return <TimelineView timelineId={params.id} />;
}