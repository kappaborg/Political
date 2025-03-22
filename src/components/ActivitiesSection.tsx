import { useTranslation } from '@/components/TranslationProvider';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';

interface ActivityItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  isOngoing: boolean;
}

export default function ActivitiesSection() {
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
      setActivities(data);
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
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateStr);
        return '';
      }
      return format(date, 'dd.MM.yyyy');
    } catch (e) {
      console.error('Date formatting error:', e);
      return '';
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

  // Gösterilecek aktivite sayısı
  const visibleActivities = activities.slice(0, 6);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">{t('activities.title', 'Etkinlikler')}</h2>
          <p className="text-gray-600 mt-2">
            {t('activities.subtitle', 'Yaklaşan ve devam eden etkinliklerimiz')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            {t('activities.noActivities', 'Şu anda hiç etkinlik bulunmamaktadır.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/activities/${activity.slug}`} className="block">
                  <div className="relative h-48 w-full">
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
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{activity.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.excerpt}</p>
                    
                    <div className="flex flex-col space-y-2 text-sm text-gray-500">
                      {activity.date && (
                        <div className="flex items-center">
                          <FiCalendar className="mr-2" />
                          <span>{formatDate(activity.date)}</span>
                        </div>
                      )}
                      
                      {activity.location && (
                        <div className="flex items-center">
                          <FiMapPin className="mr-2" />
                          <span className="line-clamp-1">{activity.location}</span>
                        </div>
                      )}
                      
                      {formatTime(activity) && (
                        <div className="flex items-center">
                          <FiClock className="mr-2" />
                          <span>{formatTime(activity)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && activities.length > 6 && (
          <div className="text-center mt-10">
            <Link
              href="/activities"
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-block"
            >
              {t('activities.viewAll', 'Tüm Etkinlikleri Görüntüle')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
} 