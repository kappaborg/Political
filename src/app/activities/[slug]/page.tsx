import { promises as fs } from 'fs';
import { Metadata } from 'next';
import path from 'path';
import ActivityDetailClient from './ActivityDetailClient';

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
}

// generateMetadata için aktivite bilgilerini getir
async function getActivity(slug: string, locale = 'en') {
  try {
    const dataFilePath = path.join(process.cwd(), 'data/json/activities.json');
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    const activities = data[locale] || data.en || [];
    const activity = activities.find((item: ActivityItem) => item.slug === slug);
    
    return activity;
  } catch (error) {
    console.error('Aktivite detayı alınırken hata:', error);
    return null;
  }
}

// Dinamik metadata oluştur
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const activity = await getActivity(params.slug);
  
  if (!activity) {
    return {
      title: 'Aktivite Bulunamadı',
      description: 'İstenen aktivite bulunamadı.'
    };
  }
  
  return {
    title: activity.title,
    description: activity.excerpt,
    openGraph: {
      title: activity.title,
      description: activity.excerpt,
      images: [activity.image]
    }
  };
}

export default async function ActivityDetailPage({ params }: { params: { slug: string } }) {
  // Sayfa yüklenmeden önce aktivitenin varlığını kontrol edin
  const activity = await getActivity(params.slug);
  
  return <ActivityDetailClient slug={params.slug} />;
} 