"use client";

import { useTranslation } from '@/components/TranslationProvider';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';
import ActivitiesList from './ActivitiesList';

// TinyMCE editörünü client-side olarak yükle
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[300px] bg-gray-100 p-4">Yükleniyor...</div>,
});

interface Activity {
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

export default function ActivitiesManager() {
  const { data: session } = useSession();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [content, setContent] = useState('');
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aktiviteleri yükle
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/activities?locale=${locale}&t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error('Aktiviteler yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Aktivite yükleme hatası:', error);
      toast.error('Aktiviteler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde veya dil değiştiğinde aktiviteleri yükle
  useEffect(() => {
    fetchActivities();
  }, [locale]);

  // Görüntü yükleme önizlemesi
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Dosya tipini kontrol et
      if (!file.type.startsWith('image/')) {
        toast.error('Lütfen geçerli bir görüntü dosyası seçin');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Dosya boyutunu kontrol et (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Görüntü dosyası 5MB\'dan küçük olmalıdır');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  // Form gönderildiğinde
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!session || session.user.role !== 'admin') {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }
    
    try {
      setLoading(true);
      
      // Form verilerini al
      const formData = new FormData(formRef.current!);
      
      // Content alanını formData'ya ekle (RichTextEditor'den)
      formData.set('content', content);
      
      // Slug alanı için otomatik oluştur
      const title = formData.get('title') as string;
      if (title && !formData.get('slug')) {
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')  // Özel karakterleri kaldır
          .replace(/\s+/g, '-')      // Boşlukları tire ile değiştir
          .replace(/--+/g, '-')      // Çoklu tireleri tek tire yap
          .trim();
        formData.set('slug', slug);
      }
      
      // Aktivite ID eklenmemişse yeni oluştur
      if (!formData.get('id')) {
        formData.set('id', Date.now().toString());
      }
      
      // Görüntü önizlemesi varsa ancak image bölümü değiştirilmediyse
      if (!fileInputRef.current?.files?.length && currentActivity?.image) {
        formData.set('image', currentActivity.image);
      }
      
      // isOngoing değerini kontrol et
      const isOngoingEl = document.getElementById('isOngoing') as HTMLInputElement;
      formData.set('isOngoing', isOngoingEl ? isOngoingEl.checked.toString() : 'false');
      
      // API'ye formu gönder
      const response = await fetch(`/api/activities?locale=${locale}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Aktivite kaydedilirken bir hata oluştu');
      }
      
      toast.success(isEditing ? 'Aktivite güncellendi' : 'Yeni aktivite eklendi');
      
      // Formu sıfırla
      formRef.current?.reset();
      setContent('');
      setPreviewImage(null);
      setIsEditing(false);
      setCurrentActivity(null);
      
      // Aktivite listesini yenile
      fetchActivities();
    } catch (error: any) {
      console.error('Aktivite kaydetme hatası:', error);
      toast.error(error.message || 'Aktivite kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Düzenleme için aktivite seç
  const handleEditActivity = (activity: Activity) => {
    setCurrentActivity(activity);
    setIsEditing(true);
    setContent(activity.content);
    setPreviewImage(activity.image);
    
    // Form alanlarına mevcut değerleri doldur
    setTimeout(() => {
      if (formRef.current) {
        const form = formRef.current;
        form.querySelector<HTMLInputElement>('input[name="title"]')!.value = activity.title;
        form.querySelector<HTMLInputElement>('input[name="slug"]')!.value = activity.slug;
        form.querySelector<HTMLTextAreaElement>('textarea[name="summary"]')!.value = activity.excerpt;
        form.querySelector<HTMLInputElement>('input[name="date"]')!.value = activity.date;
        form.querySelector<HTMLInputElement>('input[name="location"]')!.value = activity.location;
        form.querySelector<HTMLInputElement>('input[name="startTime"]')!.value = activity.startTime;
        form.querySelector<HTMLInputElement>('input[name="endTime"]')!.value = activity.endTime;
        
        const isOngoingEl = document.getElementById('isOngoing') as HTMLInputElement;
        if (isOngoingEl) {
          isOngoingEl.checked = activity.isOngoing;
        }
      }
    }, 0);
    
    // Form başlangıcına kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Aktivite silme
  const handleDeleteActivity = async (id: string) => {
    try {
      if (!window.confirm('Bu aktiviteyi silmek istediğinizden emin misiniz?')) {
        return;
      }
      
      setLoading(true);
      
      const response = await fetch(`/api/activities?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Aktivite silinirken bir hata oluştu');
      }
      
      toast.success('Aktivite başarıyla silindi');
      
      // Aktivite listesini güncelle
      setActivities(activities.filter(activity => activity.id !== id));
      
      // Eğer silinen aktivite düzenleme modundaysa, formu sıfırla
      if (currentActivity?.id === id) {
        formRef.current?.reset();
        setContent('');
        setPreviewImage(null);
        setIsEditing(false);
        setCurrentActivity(null);
      }
    } catch (error: any) {
      console.error('Aktivite silme hatası:', error);
      toast.error(error.message || 'Aktivite silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Formu temizle
  const handleClearForm = () => {
    formRef.current?.reset();
    setContent('');
    setPreviewImage(null);
    setIsEditing(false);
    setCurrentActivity(null);
  };

  // Aktivitelerin sırasını güncelle
  const handleUpdateOrder = async (reorderedIds: string[]) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/activities', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: reorderedIds,
          locale
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Aktivite sıralaması güncellenirken bir hata oluştu');
      }
      
      toast.success('Aktivite sıralaması güncellendi');
      
      // Aktivite listesini yenile
      fetchActivities();
    } catch (error: any) {
      console.error('Aktivite sıralama hatası:', error);
      toast.error(error.message || 'Aktivite sıralaması güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user.role !== 'admin') {
    return <div className="p-4">Bu sayfaya erişim izniniz yok</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        {locale === 'en' ? 'Activity Management' : 'Aktivite Yönetimi'}
      </h1>
      
      {loading && <LoadingSpinner />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aktivite ekleme/düzenleme formu */}
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {isEditing 
              ? (locale === 'en' ? 'Edit Activity' : 'Aktiviteyi Düzenle') 
              : (locale === 'en' ? 'Add New Activity' : 'Yeni Aktivite Ekle')}
          </h2>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Gizli alanlar */}
            {isEditing && <input type="hidden" name="id" value={currentActivity?.id} />}
            
            {/* Başlık */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                {locale === 'en' ? 'Title' : 'Başlık'}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Slug (URL) */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug (URL {locale === 'en' ? 'Part' : 'Parçası'})
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={locale === 'en' ? 'Automatically generated' : 'Otomatik oluşturulur'}
              />
              <p className="text-xs text-gray-500 mt-1">
                {locale === 'en' 
                  ? 'Will be automatically generated from title if left empty' 
                  : 'Boş bırakırsanız başlıktan otomatik oluşturulur'}
              </p>
            </div>
            
            {/* Özet */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                {locale === 'en' ? 'Summary' : 'Özet'}
              </label>
              <textarea
                id="summary"
                name="summary"
                rows={3}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            
            {/* İçerik */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                {locale === 'en' ? 'Content' : 'İçerik'}
              </label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
            
            {/* Tarih ve Konum */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  {locale === 'en' ? 'Date' : 'Tarih'}
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  {locale === 'en' ? 'Location' : 'Konum'}
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Başlangıç ve Bitiş Saati */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  {locale === 'en' ? 'Start Time' : 'Başlangıç Saati'}
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  {locale === 'en' ? 'End Time' : 'Bitiş Saati'}
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Devam ediyor mu */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOngoing"
                name="isOngoing"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isOngoing" className="ml-2 block text-sm font-medium text-gray-700">
                {locale === 'en' ? 'Ongoing activity' : 'Devam eden etkinlik'}
              </label>
            </div>
            
            {/* Görüntü Yükleme */}
            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">
                {locale === 'en' ? 'Image' : 'Görüntü'}
              </label>
              <input
                type="file"
                id="imageFile"
                name="imageFile"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
              />
              {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt={locale === 'en' ? 'Preview' : 'Önizleme'}
                    className="h-40 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            {/* Butonlar */}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleClearForm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {locale === 'en' ? 'Clear' : 'Temizle'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {isEditing 
                  ? (locale === 'en' ? 'Update' : 'Güncelle') 
                  : (locale === 'en' ? 'Add' : 'Ekle')}
              </button>
            </div>
          </form>
        </div>
        
        {/* Aktivite listesi */}
        <div>
          <ActivitiesList
            activities={activities}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onUpdateOrder={handleUpdateOrder}
            isProcessing={loading}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
} 