"use client";

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTranslation } from '@/components/TranslationProvider';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';

interface ActivityDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  isOngoing: boolean;
  formattedDate?: string;
}

interface ActivityDetailClientProps {
  slug: string;
}

export default function ActivityDetailClient({ slug }: ActivityDetailClientProps) {
  const { t, locale } = useTranslation();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Aktivite detayını yükle
  const fetchActivityDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dil değişikliğinde önbelleğe takılmamak için timestamp ekle
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/activities/${slug}?locale=${locale}&t=${timestamp}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Aktivite bulunamadı');
        }
        throw new Error('Aktivite detayı yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      // Tarihi formatla
      setActivity({
        ...data,
        formattedDate: formatDate(data.date)
      });
    } catch (error: any) {
      console.error('Aktivite detayı alınırken hata:', error);
      setError(error.message || 'Aktivite detayı yüklenirken bir hata oluştu');
      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [slug, locale]);

  // Sayfa yüklendiğinde veya slug/dil değiştiğinde aktivite detayını yükle
  useEffect(() => {
    fetchActivityDetail();
    // Dil veya slug değiştiğinde görüntü yükleme durumunu sıfırla
    setImageLoaded(false);
  }, [fetchActivityDetail, slug, locale]);

  // Tarih formatla
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Başlangıç ve bitiş saati formatla (eğer var ise)
  const formatTime = (activity: ActivityDetail) => {
    if (!activity.startTime) return null;
    
    let timeStr = activity.startTime;
    
    if (activity.endTime) {
      timeStr += ` - ${activity.endTime}`;
    }
    
    return timeStr;
  };

  // Görüntü yükleme durumunu izle
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <>
      <Header />
      
      <div className="bg-gray-50 py-8 md:py-12 min-h-screen">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
              <p className="text-gray-600 mb-6">{t('activities.errorMessage')}</p>
              <Link href="/activities" className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                <FiArrowLeft className="mr-2" />
                {t('activities.backToList')}
              </Link>
            </div>
          ) : activity ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              {/* Üst gezinme bağlantısı */}
              <div className="mb-6">
                <Link href="/activities" className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                  <FiArrowLeft className="mr-2" />
                  {t('activities.backToList')}
                </Link>
              </div>
              
              {/* Aktivite detay kartı */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Aktivite resmi */}
                <div className="relative h-64 md:h-96 w-full">
                  {/* Düşük kaliteli placeholder */}
                  <div 
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                    style={{ 
                      opacity: imageLoaded ? 0 : 1,
                      transition: 'opacity 0.3s ease-in-out'
                    }} 
                  />
                  
                  <Image
                    src={activity.image || '/images/activity-placeholder.jpg'}
                    alt={activity.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    style={{ 
                      opacity: imageLoaded ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                    onLoad={handleImageLoad}
                    priority
                  />
                  
                  {activity.isOngoing && (
                    <div className="absolute top-4 right-4 px-4 py-2 bg-green-500 text-white font-medium rounded-full">
                      {t('activities.ongoing')}
                    </div>
                  )}
                </div>
                
                {/* Aktivite içeriği */}
                <div className="p-6 md:p-8">
                  <h1 className="text-2xl md:text-3xl font-bold mb-4">{activity.title}</h1>
                  
                  {/* Aktivite meta bilgileri */}
                  <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2" />
                      <span>{activity.formattedDate}</span>
                    </div>
                    
                    {activity.location && (
                      <div className="flex items-center">
                        <FiMapPin className="mr-2" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                    
                    {formatTime(activity) && (
                      <div className="flex items-center">
                        <FiClock className="mr-2" />
                        <span>{formatTime(activity)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Aktivite özeti */}
                  <div className="mb-6">
                    <p className="text-gray-700 font-medium italic">{activity.excerpt}</p>
                  </div>
                  
                  {/* Aktivite içeriği */}
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: activity.content }}
                  />
                </div>
              </div>
              
              {/* Aktivite paylaşım linkleri (opsiyonel) */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-2">{t('activities.shareActivity')}</p>
                <div className="flex justify-center space-x-4">
                  {/* Sosyal medya paylaşım butonları eklenebilir */}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm">
              {t('activities.activityNotFound')}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
} 