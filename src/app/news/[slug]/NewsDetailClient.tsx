"use client";

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useTranslation } from '@/components/TranslationProvider';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

// Haber öğesi tipi
interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
}

export default function NewsDetailClient({ params }: { params: { slug: string } }) {
  const { t, locale } = useTranslation();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API rotasından haber detaylarını getir
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/news/${params.slug}?locale=${locale}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return notFound();
          }
          throw new Error('Failed to fetch news details');
        }
        
        const data = await response.json();
        setNewsItem(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewsDetail();
  }, [params.slug, locale]);

  if (!loading && !newsItem) {
    return notFound();
  }

  return (
    <>
      <Header />
      <main className="mt-24 py-12 bg-white">
        <div className="container-custom">
          <Link 
            href="/news" 
            className="inline-flex items-center mb-8 text-blue-600 hover:text-blue-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t('news.back')}
          </Link>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-gray-200 rounded mb-8"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            </div>
          ) : newsItem && (
            <article className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">{newsItem.title}</h1>
              <div className="text-blue-600 mb-6">{newsItem.date}</div>
              
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden mb-8 shadow-lg">
                <Image 
                  src={newsItem.image} 
                  alt={newsItem.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                  priority
                />
              </div>

              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: newsItem.content }}
              />
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
} 