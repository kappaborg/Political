"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import NewsForm from './NewsForm';
import NewsList from './NewsList';

type NewsItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  date: string;
};

export default function NewsManager() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const searchParams = useSearchParams();
  const locale = searchParams.get('locale') || 'en';
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/news?locale=${locale}`);
        if (!response.ok) {
          throw new Error('Haberler yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        
        // API'den gelen veriyi dönüştür
        const formattedNews = data.map((item: any) => ({
          ...item,
          summary: item.excerpt // excerpt -> summary dönüşümü
        }));
        
        setNewsItems(formattedNews);
      } catch (error) {
        console.error('News fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, [locale]);
  
  const handleEdit = (newsItem: NewsItem) => {
    setEditingItem({
      ...newsItem,
      summary: newsItem.excerpt // excerpt -> summary dönüşümü
    });
  };
  
  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
  };
  
  const handleCreate = () => {
    setIsCreating(true);
  };
  
  const handleSaved = (savedItem: NewsItem) => {
    if (editingItem) {
      // Update existing item
      setNewsItems(newsItems.map(item => 
        item.id === savedItem.id ? {
          ...savedItem,
          excerpt: savedItem.summary // summary -> excerpt dönüşümü
        } : item
      ));
      setEditingItem(null);
    } else {
      // Add new item
      setNewsItems([{
        ...savedItem,
        excerpt: savedItem.summary // summary -> excerpt dönüşümü
      }, ...newsItems]);
      setIsCreating(false);
    }
  };
  
  const handleDelete = (id: string) => {
    setNewsItems(newsItems.filter(item => item.id !== id));
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading news data...</p>
      </div>
    );
  }
  
  // Render form for editing or creating
  if (isCreating || editingItem) {
    return (
      <NewsForm 
        initialData={editingItem || undefined}
        onSave={handleSaved}
        onCancel={handleCancel}
      />
    );
  }
  
  // Render news list
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add News</span>
        </button>
      </div>
      
      <NewsList
        items={newsItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}