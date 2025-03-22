"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Site ayarları için tip tanımı
export type SiteSettings = {
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

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  error: string | null;
  locale: string;
}

// Varsayılan değerler
const defaultSettings: SiteSettings = {
  siteName: 'Municipality Portal',
  siteDescription: 'Official website of the Municipality.',
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
  primaryColor: '#2563eb',
  accentColor: '#0891b2',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Tarayıcı ortamındaysa localStorage'dan dil tercihini al
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') || 'en';
      setLocale(savedLocale);
    }
  }, []);

  // İzlenen değerlerin değişimine göre ayarları yükle
  useEffect(() => {
    // Sadece client-side'da çalıştır
    if (!isClient) return;

    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cache'leme problemlerini önlemek için timestamp ekleyerek zorla yeniden yükle
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/settings?locale=${locale}&_=${timestamp}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        console.log('Settings loaded:', data);
        setSettings(data);
      } catch (error: any) {
        console.error('Error loading settings:', error);
        setError(error.message || 'Ayarlar yüklenirken hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
    
    // 30 saniyede bir ayarları yenile (gerekirse)
    const intervalId = setInterval(fetchSettings, 30000);
    
    return () => clearInterval(intervalId);
  }, [locale, isClient]);

  // localStorage'daki dil değiştiğinde güncelle
  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = () => {
      const currentLocale = localStorage.getItem('locale') || 'en';
      if (currentLocale !== locale) {
        setLocale(currentLocale);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [locale, isClient]);

  // Renkleri CSS değişkenlerine ayarla
  useEffect(() => {
    if (!isClient) return;
    
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--accent-color', settings.accentColor);
  }, [settings.primaryColor, settings.accentColor, isClient]);

  // Context değeri
  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    error,
    locale
  };

  // Hydration mismatch'i önlemek için client-side'da olduğumuza emin oluyoruz
  if (!isClient) {
    return null;
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 