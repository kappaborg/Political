"use client";

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useTranslation } from '@/components/TranslationProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

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

export default function NewsPageClient() {
  const { t, locale } = useTranslation();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Format the date to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        // Önbelleği etkisizleştirmek için timestamp parametresi ekleyin
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/news?locale=${locale}&_t=${timestamp}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        
        // Format dates
        const formattedNews = data.map((item: any) => ({
          ...item,
          date: formatDate(item.date)
        }));
        
        setNewsItems(formattedNews);
        setImagesLoaded({});
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [locale]);

  // Görüntü yükleme durumunu izle
  const handleImageLoad = useCallback((id: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [id]: true
    }));
  }, []);

  return (
    <>
      <Header />
      <main className="bg-white">
        <div className="container-custom py-16">
          <h1 className="text-4xl font-bold mb-8 text-center">News & Updates</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No news available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((news) => (
                <div key={news.slug} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <Link href={`/news/${news.slug}`} className="block">
                    <div className="relative h-56 w-full bg-gray-200">
                      {/* Düşük kaliteli placeholder */}
                      <div className={`absolute inset-0 bg-gray-200 ${imagesLoaded[news.id] ? 'opacity-0' : 'animate-pulse'}`}></div>
                      
                      <Image 
                        src={news.image} 
                        alt={news.title} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={`object-cover transition-opacity duration-500 ${
                          imagesLoaded[news.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        quality={75}
                        onLoad={() => handleImageLoad(news.id)}
                      />
                    </div>
                    <div className="p-6">
                      <div className="text-sm text-blue-600 font-semibold mb-2">{news.date}</div>
                      <h2 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">{news.title}</h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">{news.excerpt}</p>
                      <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Read More
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
} 