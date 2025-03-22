"use client";

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

export default function MainContent() {
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
    // API rotasından haberleri getir
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        // Önbelleği etkisizleştirmek için timestamp parametresi ekleyin
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/news?locale=${locale}&_t=${timestamp}`);
        if (!response.ok) throw new Error('Failed to fetch news');
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

  // İlk 3 haberi göster
  const featuredNews = newsItems.slice(0, 3);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">{t('main.news.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('main.news.subtitle')}</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredNews.map((news) => (
              <div key={news.slug} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-48 w-full bg-gray-200">
                  {/* Düşük kaliteli placeholder */}
                  <div className={`absolute inset-0 bg-gray-200 ${imagesLoaded[news.id] ? 'opacity-0' : 'animate-pulse'}`}></div>
                  
                  <Image 
                    src={news.image} 
                    alt={news.title} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={`object-cover transition-opacity duration-500 ${
                      imagesLoaded[news.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    quality={75}
                    onLoad={() => handleImageLoad(news.id)}
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-accent font-semibold mb-2">{news.date}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">{news.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{news.excerpt}</p>
                  <Link href={`/news/${news.slug}`} className="inline-block px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
                    {t('main.news.readMore')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link href="/news" className="inline-block px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
            {t('main.news.allNews')}
          </Link>
        </div>
      </div>
    </section>
  );
} 