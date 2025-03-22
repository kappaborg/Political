import { TranslationProvider } from '@/components/TranslationProvider';
import { Metadata } from 'next';
import NewsPageClient from './NewsPageClient';

export const metadata: Metadata = {
  title: 'News & Updates | Municipality',
  description: 'Stay informed with the latest news and updates from our municipality.'
};

export default function NewsPage() {
  return (
    <TranslationProvider>
      <NewsPageClient />
    </TranslationProvider>
  );
}
