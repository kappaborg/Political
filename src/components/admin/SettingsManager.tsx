"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

type SiteSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  logo?: string;
  primaryColor: string;
  accentColor: string;
};

export default function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    logo: '/images/logo-placeholder.png',
    primaryColor: '#2563eb', // Blue
    accentColor: '#0891b2', // Cyan
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locale, setLocale] = useState('bs');
  
  const [logoPreview, setLogoPreview] = useState<string | undefined>(settings.logo);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // API'den settings verilerini yükle
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // Get current locale from URL or default to 'en'
        const currLocale = new URLSearchParams(window.location.search).get('locale') || 'en';
        setLocale(currLocale);
        
        const response = await fetch(`/api/settings?locale=${currLocale}`);
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        setSettings(data);
        setLogoPreview(data.logo || '/images/logo-placeholder.png');
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error(locale === 'en' ? 'Error loading settings' : 'Ayarlar yüklenirken hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties (for social media)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof SiteSettings] as Record<string, string>),
          [child]: value,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: value,
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setLogoFile(file);
      
      // Create preview URL for the UI
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!settings.siteName) {
      newErrors.siteName = locale === 'en' ? 'Site name is required' : 'Site adı gereklidir';
    }
    if (!settings.contactEmail) {
      newErrors.contactEmail = locale === 'en' ? 'Contact email is required' : 'İletişim e-postası gereklidir';
    }
    
    // Validate email format
    if (settings.contactEmail && !/^\S+@\S+\.\S+$/.test(settings.contactEmail)) {
      newErrors.contactEmail = locale === 'en' ? 'Invalid email format' : 'Geçersiz e-posta formatı';
    }
    
    // Validate URLs
    const invalidUrlMessage = locale === 'en' ? 'Invalid URL format' : 'Geçersiz URL formatı';
    if (settings.socialMedia.facebook && !isValidUrl(settings.socialMedia.facebook)) {
      newErrors['socialMedia.facebook'] = invalidUrlMessage;
    }
    if (settings.socialMedia.twitter && !isValidUrl(settings.socialMedia.twitter)) {
      newErrors['socialMedia.twitter'] = invalidUrlMessage;
    }
    if (settings.socialMedia.instagram && !isValidUrl(settings.socialMedia.instagram)) {
      newErrors['socialMedia.instagram'] = invalidUrlMessage;
    }
    if (settings.socialMedia.youtube && !isValidUrl(settings.socialMedia.youtube)) {
      newErrors['socialMedia.youtube'] = invalidUrlMessage;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setIsSaved(false);
    
    try {
      // Prepare form data for API
      const formData = new FormData();
      
      // Add all text fields
      formData.append('siteName', settings.siteName);
      formData.append('siteDescription', settings.siteDescription);
      formData.append('contactEmail', settings.contactEmail);
      formData.append('contactPhone', settings.contactPhone);
      formData.append('address', settings.address);
      
      // Add social media fields
      Object.entries(settings.socialMedia).forEach(([key, value]) => {
        formData.append(`socialMedia.${key}`, value || '');
      });
      
      // Add colors
      formData.append('primaryColor', settings.primaryColor);
      formData.append('accentColor', settings.accentColor);
      
      // Add logo
      if (logoFile) {
        formData.append('logoFile', logoFile);
      } else if (settings.logo) {
        formData.append('logo', settings.logo);
      }
      
      // Send API request
      const response = await fetch(`/api/settings?locale=${locale}`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || (locale === 'en' ? 'Error saving settings' : 'Ayarlar kaydedilirken bir hata oluştu'));
      }
      
      console.log("API yanıtı:", result);
      
      // Show success message
      toast.success(locale === 'en' ? 'Settings saved successfully' : 'Ayarlar başarıyla kaydedildi');
      setIsSaved(true);
      
      // Update settings with the saved data
      setSettings(result.data);
      setLogoPreview(result.data.logo);
      setLogoFile(null);
      
      // Reset the saved indicator after a delay
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error: any) {
      console.error("Ayarları kaydetme hatası:", error);
      toast.error(`${locale === 'en' ? 'Error' : 'Hata'}: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{locale === 'en' ? 'Loading settings...' : 'Ayarlar yükleniyor...'}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* General Settings */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {locale === 'en' ? 'General Settings' : 'Genel Ayarlar'}
        </h2>
        
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Site Name' : 'Site Adı'}
            </label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-accent focus:ring-accent text-gray-700 ${
                errors.siteName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.siteName && <p className="mt-1 text-sm text-red-600">{errors.siteName}</p>}
          </div>
          
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Website Logo' : 'Site Logosu'}
            </label>
            <div className="mt-2 flex items-center space-x-6">
              {logoPreview && (
                <div className="relative h-16 w-16 rounded overflow-hidden border border-gray-300">
                  <Image 
                    src={logoPreview} 
                    alt={locale === 'en' ? 'Logo preview' : 'Logo önizleme'} 
                    fill
                    sizes="64px"
                    style={{ objectFit: 'contain' }} 
                  />
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-accent file:text-white
                    hover:file:bg-accent/90"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'en' ? 'Recommended size: 180×60 pixels' : 'Önerilen boyut: 180×60 piksel'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Site Description' : 'Site Açıklaması'}
            </label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              rows={2}
              value={settings.siteDescription}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              {locale === 'en' 
                ? 'A brief description of your website that may appear in search results.' 
                : 'Arama sonuçlarında görünebilecek kısa bir site açıklaması.'}
            </p>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-800 mt-8 mb-4">
          {locale === 'en' ? 'Colors' : 'Renkler'}
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Primary Color' : 'Ana Renk'}
            </label>
            <div className="mt-1 flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded border border-gray-300" 
                style={{ backgroundColor: settings.primaryColor }}
              />
              <input
                type="text"
                id="primaryColor"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-gray-700"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Accent Color' : 'Vurgu Rengi'}
            </label>
            <div className="mt-1 flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded border border-gray-300" 
                style={{ backgroundColor: settings.accentColor }}
              />
              <input
                type="text"
                id="accentColor"
                name="accentColor"
                value={settings.accentColor}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-gray-700"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {locale === 'en' ? 'Contact Information' : 'İletişim Bilgileri'}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Email Address' : 'E-posta Adresi'}
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-accent focus:ring-accent text-gray-700 ${
                errors.contactEmail ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>}
          </div>
          
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Phone Number' : 'Telefon Numarası'}
            </label>
            <input
              type="text"
              id="contactPhone"
              name="contactPhone"
              value={settings.contactPhone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-gray-700"
            />
          </div>
          
          <div className="col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Address' : 'Adres'}
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              value={settings.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-gray-700"
            />
          </div>
        </div>
      </div>
      
      {/* Social Media Links */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {locale === 'en' ? 'Social Media Links' : 'Sosyal Medya Bağlantıları'}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="socialMedia.facebook" className="block text-sm font-medium text-gray-700">
              Facebook
            </label>
            <input
              type="url"
              id="socialMedia.facebook"
              name="socialMedia.facebook"
              value={settings.socialMedia.facebook || ''}
              onChange={handleChange}
              placeholder="https://facebook.com/yourpage"
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-accent focus:ring-accent text-gray-700 ${
                errors['socialMedia.facebook'] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors['socialMedia.facebook'] && (
              <p className="mt-1 text-sm text-red-600">{errors['socialMedia.facebook']}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="socialMedia.twitter" className="block text-sm font-medium text-gray-700">
              Twitter
            </label>
            <input
              type="url"
              id="socialMedia.twitter"
              name="socialMedia.twitter"
              value={settings.socialMedia.twitter || ''}
              onChange={handleChange}
              placeholder="https://twitter.com/yourhandle"
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-accent focus:ring-accent text-gray-700 ${
                errors['socialMedia.twitter'] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors['socialMedia.twitter'] && (
              <p className="mt-1 text-sm text-red-600">{errors['socialMedia.twitter']}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="socialMedia.instagram" className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <input
              type="url"
              id="socialMedia.instagram"
              name="socialMedia.instagram"
              value={settings.socialMedia.instagram || ''}
              onChange={handleChange}
              placeholder="https://instagram.com/yourprofile"
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-accent focus:ring-accent text-gray-700 ${
                errors['socialMedia.instagram'] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors['socialMedia.instagram'] && (
              <p className="mt-1 text-sm text-red-600">{errors['socialMedia.instagram']}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="socialMedia.youtube" className="block text-sm font-medium text-gray-700">
              YouTube
            </label>
            <input
              type="url"
              id="socialMedia.youtube"
              name="socialMedia.youtube"
              value={settings.socialMedia.youtube || ''}
              onChange={handleChange}
              placeholder="https://youtube.com/yourchannel"
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-accent focus:ring-accent text-gray-700 ${
                errors['socialMedia.youtube'] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors['socialMedia.youtube'] && (
              <p className="mt-1 text-sm text-red-600">{errors['socialMedia.youtube']}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
        >
          <FiSave className="mr-2 -ml-1 h-5 w-5" />
          {isSaving 
            ? (locale === 'en' ? 'Saving...' : 'Kaydediliyor...') 
            : isSaved 
              ? (locale === 'en' ? 'Saved!' : 'Kaydedildi!') 
              : (locale === 'en' ? 'Save Settings' : 'Ayarları Kaydet')}
        </button>
      </div>
    </form>
  );
} 