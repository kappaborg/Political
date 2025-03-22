import { promises as fsPromises } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
}

const newsFilePath = path.join(process.cwd(), 'data/json/news.json');

// JSON dosyasından haberleri oku
async function readNewsFile(): Promise<Record<string, NewsItem[]>> {
  try {
    const data = await fsPromises.readFile(newsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading news file:', error);
    return { en: [], bs: [] };
  }
}

// JSON dosyasına haberleri yaz
async function writeNewsFile(newsData: Record<string, NewsItem[]>): Promise<boolean> {
  try {
    await fsPromises.writeFile(newsFilePath, JSON.stringify(newsData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing news file:', error);
    return false;
  }
}

// Tüm haberleri getir
export async function getNewsItems(locale: string = 'en'): Promise<NewsItem[]> {
  const newsData = await readNewsFile();
  return newsData[locale] || newsData.en || [];
}

// Slug'a göre haber getir
export function getNewsBySlug(slug: string, locale: string = 'en'): Promise<NewsItem | undefined> {
  return getNewsItems(locale).then(items => items.find(item => item.slug === slug));
}

// ID'ye göre haber getir
export async function getNewsById(id: string, locale: string = 'en'): Promise<NewsItem | undefined> {
  const newsItems = await getNewsItems(locale);
  return newsItems.find(item => item.id === id);
}

// Yeni haber ekle
export async function addNewsItem(newsItem: Omit<NewsItem, 'id'>, locale: string = 'en'): Promise<NewsItem> {
  const newsData = await readNewsFile();
  
  const newItem: NewsItem = {
    id: uuidv4(),
    ...newsItem
  };
  
  // Dil için array yoksa oluştur
  if (!newsData[locale]) {
    newsData[locale] = [];
  }
  
  newsData[locale].unshift(newItem); // Yeni haberi başa ekle
  await writeNewsFile(newsData);
  
  return newItem;
}

// Haberi güncelle
export async function updateNewsItem(id: string, updatedFields: Partial<NewsItem>, locale: string = 'en'): Promise<boolean> {
  const newsData = await readNewsFile();
  
  if (!newsData[locale]) {
    return false;
  }
  
  const itemIndex = newsData[locale].findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return false;
  }
  
  newsData[locale][itemIndex] = {
    ...newsData[locale][itemIndex],
    ...updatedFields
  };
  
  return writeNewsFile(newsData);
}

// Haberi sil
export async function deleteNewsItem(id: string, locale: string = 'en'): Promise<boolean> {
  const newsData = await readNewsFile();
  
  if (!newsData[locale]) {
    return false;
  }
  
  const initialLength = newsData[locale].length;
  newsData[locale] = newsData[locale].filter(item => item.id !== id);
  
  if (newsData[locale].length === initialLength) {
    return false; // Hiçbir haber silinmedi
  }
  
  return writeNewsFile(newsData);
}

// Slug oluştur
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Özel karakterleri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/^-+|-+$/g, ''); // Baştaki ve sondaki tireleri kaldır
}

// Tüm haber slug'larını getir
export async function getAllNewsSlugs(): Promise<{ slug: string }[]> {
  const enNews = await getNewsItems('en');
  const bsNews = await getNewsItems('bs');
  
  // Her iki dildeki benzersiz slug'ları topla
  const slugs = new Set([
    ...enNews.map(item => item.slug),
    ...bsNews.map(item => item.slug)
  ]);
  
  return Array.from(slugs).map(slug => ({ slug }));
} 