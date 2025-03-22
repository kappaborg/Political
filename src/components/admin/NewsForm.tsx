"use client";

import { useTranslation } from '@/components/TranslationProvider';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiSave, FiX } from 'react-icons/fi';

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
};

interface NewsFormProps {
  initialData?: NewsItem;
  onSave: (news: NewsItem) => void;
  onCancel: () => void;
}

// Form çevirileri için tip tanımları
type FormTranslationKey = 
  | 'form.editTitle' | 'form.addTitle' | 'form.title' | 'form.slug' 
  | 'form.slugHelp' | 'form.date' | 'form.summary' | 'form.content' 
  | 'form.image' | 'form.imageHelp' | 'form.cancel' | 'form.saving' 
  | 'form.save' | 'validation.title' | 'validation.slug' | 'validation.summary' 
  | 'validation.content' | 'validation.date';

type FormTranslations = {
  [locale in 'en' | 'bs']: {
    [key in FormTranslationKey]: string;
  }
};

// Formda kullanılacak çeviriler
const formTranslations: FormTranslations = {
  en: {
    'form.editTitle': 'Edit News Article',
    'form.addTitle': 'Add New Article',
    'form.title': 'Title',
    'form.slug': 'Slug (URL-friendly name)',
    'form.slugHelp': 'Auto-generated from title. This will be used in the URL.',
    'form.date': 'Publication Date',
    'form.summary': 'Summary',
    'form.content': 'Content',
    'form.image': 'Featured Image',
    'form.imageHelp': 'Recommended size: 1200×630 pixels',
    'form.cancel': 'Cancel',
    'form.saving': 'Saving...',
    'form.save': 'Save Article',
    'validation.title': 'Title is required',
    'validation.slug': 'Slug is required',
    'validation.summary': 'Summary is required',
    'validation.content': 'Content is required',
    'validation.date': 'Date is required'
  },
  bs: {
    'form.editTitle': 'Uredi članak',
    'form.addTitle': 'Dodaj novi članak',
    'form.title': 'Naslov',
    'form.slug': 'Slug (URL-prijateljski naziv)',
    'form.slugHelp': 'Automatski generisano iz naslova. Ovo će biti korišteno u URL-u.',
    'form.date': 'Datum objavljivanja',
    'form.summary': 'Sažetak',
    'form.content': 'Sadržaj',
    'form.image': 'Glavna slika',
    'form.imageHelp': 'Preporučena veličina: 1200×630 piksela',
    'form.cancel': 'Odustani',
    'form.saving': 'Spremanje...',
    'form.save': 'Spremi članak',
    'validation.title': 'Naslov je obavezan',
    'validation.slug': 'Slug je obavezan',
    'validation.summary': 'Sažetak je obavezan',
    'validation.content': 'Sadržaj je obavezan',
    'validation.date': 'Datum je obavezan'
  }
};

export default function NewsForm({ initialData, onSave, onCancel }: NewsFormProps) {
  const { locale } = useTranslation();
  const [formData, setFormData] = useState<Omit<NewsItem, 'id'> & { id?: string }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '/images/news-placeholder.jpg',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [previewImage, setPreviewImage] = useState<string>('/images/news-placeholder.jpg');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Çeviri fonksiyonu
  const t = (key: FormTranslationKey): string => {
    return formTranslations[locale as 'en' | 'bs']?.[key] || formTranslations.en[key] || key;
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewImage(initialData.image);
    }
  }, [initialData]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Generate slug from title
    if (name === 'title') {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImageFile(file);
      
      // Create a preview URL for the UI
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      // Note: we'll upload the actual file when form is submitted
      // For now, just store the file and update the form data with the filename
      setFormData((prev) => ({
        ...prev,
        image: file.name, // API will replace this with the actual path after upload
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = t('validation.title');
    if (!formData.slug) newErrors.slug = t('validation.slug');
    if (!formData.excerpt) newErrors.excerpt = t('validation.summary');
    if (!formData.content) newErrors.content = t('validation.content');
    if (!formData.date) newErrors.date = t('validation.date');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare form data for API
      const apiFormData = new FormData();
      
      // Add all text fields
      if (initialData?.id) {
        apiFormData.append('id', initialData.id);
      }
      apiFormData.append('title', formData.title);
      apiFormData.append('slug', formData.slug);
      apiFormData.append('excerpt', formData.excerpt);
      apiFormData.append('content', formData.content);
      apiFormData.append('date', formData.date);
      
      // Add image file if selected
      if (imageFile) {
        apiFormData.append('imageFile', imageFile);
      } else {
        apiFormData.append('image', formData.image);
      }
      
      console.log("Gönderilen veriler:", Object.fromEntries(apiFormData.entries()));
      
      // Get current locale from URL or default to 'en'
      const locale = new URLSearchParams(window.location.search).get('locale') || 'en';
      
      // Send API request
      const response = await fetch(`/api/news?locale=${locale}`, {
        method: 'POST',
        body: apiFormData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Haber kaydedilirken bir hata oluştu');
      }
      
      console.log("API yanıtı:", result);
      
      // Show success message
      toast.success('Haber başarıyla kaydedildi');
      
      // Call the onSave function with the saved news data
      onSave({
        id: result.data.id,
        title: result.data.title,
        slug: result.data.slug,
        excerpt: result.data.excerpt,
        content: result.data.content,
        image: result.data.image,
        date: result.data.date
      });
    } catch (error: any) {
      console.error("Haber kaydetme hatası:", error);
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">
        {initialData ? t('form.editTitle') : t('form.addTitle')}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            {t('form.title')}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>
        
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            {t('form.slug')}
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent ${
              errors.slug ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
          <p className="mt-1 text-xs text-gray-500">
            {t('form.slugHelp')}
          </p>
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            {t('form.date')}
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>
        
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
            {t('form.summary')}
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent ${
              errors.excerpt ? 'border-red-500' : 'border-gray-300'
            }`}
          ></textarea>
          {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>}
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            {t('form.content')}
          </label>
          <textarea
            id="content"
            name="content"
            rows={6}
            value={formData.content}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
        </div>
        
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            {t('form.image')}
          </label>
          <div className="mt-2 flex items-start space-x-5">
            <div className="relative h-32 w-56 rounded overflow-hidden border border-gray-300">
              <Image 
                src={previewImage} 
                alt="News preview" 
                fill
                style={{ objectFit: 'cover' }} 
              />
            </div>
            <div>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="block text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-accent file:text-white
                  hover:file:bg-accent/90"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('form.imageHelp')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          <FiX className="mr-2 -ml-1 h-5 w-5" />
          {t('form.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
        >
          <FiSave className="mr-2 -ml-1 h-5 w-5" />
          {isSubmitting ? t('form.saving') : t('form.save')}
        </button>
      </div>
    </form>
  );
} 