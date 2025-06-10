import { Metadata } from 'next';
import { TemplateShowcase } from '~/components/timeline/TemplateShowcase';
import { APP_NAME, APP_DESCRIPTION } from '~/lib/constants';

export const metadata: Metadata = {
  title: `Timeline Templates | ${APP_NAME}`,
  description: APP_DESCRIPTION,
};

export default function TemplatesPage() {
  return <TemplateShowcase />;
} 