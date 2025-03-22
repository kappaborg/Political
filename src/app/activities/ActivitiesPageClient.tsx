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
import { FiCalendar, FiChevronRight, FiClock, FiMapPin } from 'react-icons/fi';

interface ActivityItem {
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

export default function ActivitiesPageClient() {
  const { t, locale } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Aktiviteleri yükle
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      // Dil değişikliğinde önbelleğe takılmamak için timestamp ekle
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/activities?locale=${locale}&t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error('Aktiviteler yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      // Verileri işle ve tarihleri formatla
      const processedData = data.map((item: ActivityItem) => ({
        ...item,
        formattedDate: formatDate(item.date)
      }));
      
      setActivities(processedData);
    } catch (error) {
      console.error('Aktivite yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  // Sayfa yüklendiğinde veya dil değiştiğinde aktiviteleri yükle
  useEffect(() => {
    fetchActivities();
    // Dil değiştiğinde tüm resim yükleme durumlarını sıfırla
    setImagesLoaded({});
  }, [fetchActivities, locale]);

  // Tarih formatla
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Görüntü yükleme durumunu izle
  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  // Başlangıç ve bitiş saati formatla (eğer var ise)
  const formatTime = (activity: ActivityItem) => {
    if (!activity.startTime) return null;
    
    let timeStr = activity.startTime;
    
    if (activity.endTime) {
      timeStr += ` - ${activity.endTime}`;
    }
    
    return timeStr;
  };

  // Devam eden ve gelecek aktiviteleri ayır
  const ongoingActivities = activities.filter(a => a.isOngoing);
  const upcomingActivities = activities.filter(a => !a.isOngoing && new Date(a.date) >= new Date());
  const pastActivities = activities.filter(
    a => !a.isOngoing && new Date(a.date) < new Date()
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aktivite kartını render et
  const renderActivityCard = (activity: ActivityItem, index: number) => (
    <motion.div
      key={activity.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full"
    >
      <Link href={`/activities/${activity.slug}`} className="block h-full flex flex-col">
        <div className="relative h-48 w-full flex-shrink-0">
          {/* Düşük kaliteli placeholder */}
          <div 
            className="absolute inset-0 bg-gray-200 animate-pulse"
            style={{ 
              opacity: imagesLoaded[activity.id] ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }} 
          />
          
          <Image
            src={activity.image || '/images/activity-placeholder.jpg'}
            alt={activity.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            style={{ 
              opacity: imagesLoaded[activity.id] ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
            onLoad={() => handleImageLoad(activity.id)}
          />
          
          {activity.isOngoing && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              {t('activities.ongoing', 'Devam Ediyor')}
            </div>
          )}
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{activity.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{activity.excerpt}</p>
          
          <div className="flex flex-col space-y-2 text-sm text-gray-500 mt-auto">
            <div className="flex items-center">
              <FiCalendar className="mr-2 flex-shrink-0" />
              <span>{activity.formattedDate}</span>
            </div>
            
            {activity.location && (
              <div className="flex items-center">
                <FiMapPin className="mr-2 flex-shrink-0" />
                <span className="line-clamp-1">{activity.location}</span>
              </div>
            )}
            
            {formatTime(activity) && (
              <div className="flex items-center">
                <FiClock className="mr-2 flex-shrink-0" />
                <span>{formatTime(activity)}</span>
              </div>
            )}
            
            <div className="flex items-center text-indigo-600 font-medium mt-2">
              <span>{t('activities.readMore', 'Devamını Oku')}</span>
              <FiChevronRight className="ml-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <>
      <Header />
      
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t('activities.pageTitle', 'Etkinlikler')}
            </h1>
            <p className="text-gray-600">
              {t('activities.pageDescription', 'Tüm etkinliklerimize göz atın ve katılın')}
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm">
              {t('activities.noActivities', 'Şu anda hiç etkinlik bulunmamaktadır.')}
            </div>
          ) : (
            <div className="space-y-16">
              {/* Devam eden etkinlikler */}
              {ongoingActivities.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 pb-2 border-b">
                    {t('activities.ongoingActivities', 'Devam Eden Etkinlikler')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ongoingActivities.map((activity, index) => renderActivityCard(activity, index))}
                  </div>
                </section>
              )}
              
              {/* Yaklaşan etkinlikler */}
              {upcomingActivities.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 pb-2 border-b">
                    {t('activities.upcomingActivities', 'Yaklaşan Etkinlikler')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingActivities.map((activity, index) => renderActivityCard(activity, index))}
                  </div>
                </section>
              )}
              
              {/* Geçmiş etkinlikler */}
              {pastActivities.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 pb-2 border-b">
                    {t('activities.pastActivities', 'Geçmiş Etkinlikler')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastActivities.slice(0, 6).map((activity, index) => renderActivityCard(activity, index))}
                  </div>
                  
                  {pastActivities.length > 6 && (
                    <div className="text-center mt-8">
                      <button 
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={() => {
                          // Buraya tıklandığında daha fazla geçmiş etkinlik gösterme mantığı eklenebilir
                          // Şimdilik basit bir alert
                          alert(t('activities.moreActivitiesSoon', 'Daha fazla etkinlik yakında eklenecek'));
                        }}
                      >
                        {t('activities.loadMore', 'Daha Fazla Göster')}
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
} 