import { TranslationProvider } from '@/components/TranslationProvider';
import { getNewsBySlug } from '@/utils/news';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsDetailClient from './NewsDetailClient';

// Server-Side Functions
export async function generateStaticParams() {
  // Kullanılan fonksiyonlar bulunamadığı için yoruma alındı
  // const slugs = getAllNewsSlugs();
  // return slugs.map(slug => ({ slug }));
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // getNewsItemBySlug fonksiyonu bulunamadığı için getNewsBySlug ile değiştirdim
  const newsItem = getNewsBySlug(params.slug);
  
  if (!newsItem) {
    return {
      title: 'News Article Not Found'
    };
  }
  
  return {
    title: `${newsItem.title} | Municipality News`,
    description: newsItem.excerpt || ''
  };
}

// Server Component that wraps client component
export default function NewsPage({ params }: { params: { slug: string } }) {
  // Server tarafında ön kontrol yapıyoruz
  const newsItem = getNewsBySlug(params.slug);
  
  // Eğer haber bulunamazsa 404 sayfasına yönlendir
  if (!newsItem) {
    notFound();
  }
  
  return (
    <TranslationProvider>
      <NewsDetailClient params={params} />
    </TranslationProvider>
  );
} 