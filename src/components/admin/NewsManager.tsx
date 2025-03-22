"use client";

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import NewsForm from './NewsForm';
import NewsList from './NewsList';

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string;
  date: string;
};

export default function NewsManager() {
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // API'den haber verilerini yükle
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        // Get current locale from URL or default to 'en'
        const locale = new URLSearchParams(window.location.search).get('locale') || 'en';
        
        const response = await fetch(`/api/news?locale=${locale}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news data');
        }
        
        const data = await response.json();
        
        // API'den gelen verileri NewsItem formatına dönüştür
        const formattedNews: NewsItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          summary: item.excerpt,
          content: item.content,
          image: item.image,
          date: item.date
        }));
        
        setNewsItems(formattedNews);
      } catch (error) {
        console.error('Error loading news data:', error);
        toast.error('Haber verileri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewsData();
  }, []);

  const handleEdit = (news: NewsItem) => {
    setEditingNews(news);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu haber öğesini silmek istediğinize emin misiniz?')) {
      try {
        // Get current locale from URL or default to 'en'
        const locale = new URLSearchParams(window.location.search).get('locale') || 'en';
        
        // Send delete request to API
        const response = await fetch(`/api/news?id=${id}&locale=${locale}`, { 
          method: 'DELETE' 
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete news item');
        }
        
        // Remove from UI
        setNewsItems(newsItems.filter(item => item.id !== id));
        toast.success('Haber silindi');
      } catch (error) {
        console.error('Silme hatası:', error);
        toast.error('Haber silinirken bir hata oluştu');
      }
    }
  };

  const handleSave = (news: NewsItem) => {
    if (editingNews) {
      // Update existing news
      setNewsItems(newsItems.map(item => item.id === news.id ? news : item));
      setEditingNews(null);
    } else {
      // Add new news
      setNewsItems([
        news,
        ...newsItems
      ]);
      setIsCreating(false);
    }
    
    // Show success toast
    toast.success(editingNews ? 'Haber güncellendi' : 'Yeni haber eklendi');
  };

  const handleCancel = () => {
    setEditingNews(null);
    setIsCreating(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading news data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isCreating && !editingNews && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreating(true)}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <FiPlus />
            <span>Add News</span>
          </button>
        </div>
      )}

      {(isCreating || editingNews) ? (
        <NewsForm 
          initialData={editingNews || undefined} 
          onSave={handleSave} 
          onCancel={handleCancel} 
        />
      ) : (
        <NewsList 
          newsItems={newsItems} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}
    </div>
  );
}