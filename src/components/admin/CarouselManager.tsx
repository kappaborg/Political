"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiArrowDown, FiArrowUp, FiEdit2, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';

type CarouselSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
};

export default function CarouselManager() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Omit<CarouselSlide, 'id'> & { id?: string }>({
    title: '',
    subtitle: '',
    image: '/images/carousel-placeholder.jpg',
    buttonText: '',
    buttonLink: '#'
  });
  
  const [previewImage, setPreviewImage] = useState('/images/carousel-placeholder.jpg');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API'den carousel verilerini yükle
  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        setLoading(true);
        // Get current locale from URL or default to 'en'
        const locale = new URLSearchParams(window.location.search).get('locale') || 'en';
        
        const response = await fetch(`/api/carousel?locale=${locale}`);
        if (!response.ok) {
          throw new Error('Failed to fetch carousel data');
        }
        
        const data = await response.json();
        setSlides(data);
      } catch (error) {
        console.error('Error loading carousel data:', error);
        toast.error('Carousel verileri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarouselData();
  }, []);

  const handleStartEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setFormData({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      buttonText: slide.buttonText || '',
      buttonLink: slide.buttonLink || '#'
    });
    setPreviewImage(slide.image);
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      image: '/images/carousel-placeholder.jpg',
      buttonText: '',
      buttonLink: '#'
    });
    setPreviewImage('/images/carousel-placeholder.jpg');
    setImageFile(null);
    setErrors({});
    setIsCreating(true);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setEditingSlide(null);
    setIsCreating(false);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
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
      
      // Create a preview URL for the image
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      // Update form data with image filename
      setFormData(prev => ({
        ...prev,
        image: file.name
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.subtitle) newErrors.subtitle = 'Subtitle is required';
    if (formData.buttonText && !formData.buttonLink) newErrors.buttonLink = 'Button link is required when button text is provided';
    
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
      
      // Add text fields
      if (editingSlide) {
        apiFormData.append('id', editingSlide.id);
      }
      apiFormData.append('title', formData.title);
      apiFormData.append('subtitle', formData.subtitle);
      apiFormData.append('buttonText', formData.buttonText || '');
      apiFormData.append('buttonLink', formData.buttonLink || '#');
      
      // Add image file if selected
      if (imageFile) {
        apiFormData.append('imageFile', imageFile);
      } else {
        apiFormData.append('image', formData.image);
      }
      
      // Get current locale from URL or default to 'en'
      const locale = new URLSearchParams(window.location.search).get('locale') || 'en';
      
      // Send API request
      const response = await fetch(`/api/carousel?locale=${locale}`, {
        method: 'POST',
        body: apiFormData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Carousel öğesi kaydedilirken bir hata oluştu');
      }
      
      console.log("API yanıtı:", result);
      
      // Show success message
      toast.success('Carousel öğesi başarıyla kaydedildi');
      
      // Update UI with the new slide
      const savedSlide = result.data;
      
      if (editingSlide) {
        // Update existing slide
        setSlides(slides.map(slide => 
          slide.id === savedSlide.id ? savedSlide : slide
        ));
        setEditingSlide(null);
      } else {
        // Add new slide
        setSlides([...slides, savedSlide]);
        setIsCreating(false);
      }
    } catch (error: any) {
      console.error('Carousel öğesi kaydedilirken hata:', error);
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu carousel öğesini silmek istediğinize emin misiniz?')) {
      try {
        // Get current locale from URL or default to 'en'
        const locale = new URLSearchParams(window.location.search).get('locale') || 'en';
        
        // Send delete request to API
        const response = await fetch(`/api/carousel?id=${id}&locale=${locale}`, { 
          method: 'DELETE' 
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete carousel item');
        }
        
        // Remove from UI
        setSlides(slides.filter(slide => slide.id !== id));
        toast.success('Carousel öğesi silindi');
      } catch (error) {
        console.error('Silme hatası:', error);
        toast.error('Carousel öğesi silinirken bir hata oluştu');
      }
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...slides];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSlides[index];
    newSlides[index] = newSlides[newIndex];
    newSlides[newIndex] = temp;
    
    setSlides(newSlides);
    
    // Sıralama değişikliğini API'ye gönder
    try {
      setLoading(true);
      
      // Sıralama için ID listesi oluştur
      const itemIds = newSlides.map(item => item.id);
      
      const response = await fetch(`/api/carousel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemIds,
          locale: new URLSearchParams(window.location.search).get('locale') || 'en'
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Sıralama güncellenirken bir hata oluştu');
        return;
      }
      
      toast.success('Sıralama başarıyla güncellendi');
    } catch (error) {
      console.error('Sıralama hatası:', error);
      toast.error('Sıralama güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading carousel data...</p>
      </div>
    );
  }

  // Render form for editing or creating
  if (isCreating || editingSlide) {
    return (
      <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">
          {editingSlide ? 'Edit Carousel Slide' : 'Add New Slide'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-accent focus:ring-accent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          
          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
              Subtitle
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-accent focus:ring-accent ${
                errors.subtitle ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.subtitle && <p className="mt-1 text-sm text-red-600">{errors.subtitle}</p>}
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700">
                Button Text (optional)
              </label>
              <input
                type="text"
                id="buttonText"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
              />
            </div>
            
            <div>
              <label htmlFor="buttonLink" className="block text-sm font-medium text-gray-700">
                Button Link
              </label>
              <input
                type="text"
                id="buttonLink"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-accent focus:ring-accent ${
                  errors.buttonLink ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.buttonLink && <p className="mt-1 text-sm text-red-600">{errors.buttonLink}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Background Image
            </label>
            <div className="mt-2 flex items-start space-x-5">
              <div className="relative h-32 w-56 rounded overflow-hidden border border-gray-300">
                <Image 
                  src={previewImage} 
                  alt="Carousel slide preview" 
                  fill
                  style={{ objectFit: 'cover' }} 
                />
              </div>
              <div>
                <input
                  type="file"
                  id="image"
                  name="image"
                  ref={fileInputRef}
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
                  Recommended size: 1920×800 pixels
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            <FiX className="mr-2 -ml-1 h-5 w-5" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
          >
            <FiSave className="mr-2 -ml-1 h-5 w-5" />
            {isSubmitting ? 'Saving...' : 'Save Slide'}
          </button>
        </div>
      </form>
    );
  }

  // Render carousel slides list
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleStartCreate}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Slide</span>
        </button>
      </div>
      
      {slides.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-10 text-center">
          <p className="text-gray-500">No carousel slides found. Add your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtitle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slides.map((slide, index) => (
                  <tr key={slide.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative h-12 w-24 rounded overflow-hidden">
                        <Image 
                          src={slide.image} 
                          alt={slide.title} 
                          fill
                          style={{ objectFit: 'cover' }} 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{slide.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{slide.subtitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveSlide(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FiArrowUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => moveSlide(index, 'down')}
                          disabled={index === slides.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FiArrowDown className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleStartEdit(slide)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 