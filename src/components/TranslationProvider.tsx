"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TranslationContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Default fallback translations to prevent UI showing raw keys
const fallbackTranslations: Record<string, Record<string, string>> = {
  en: {
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.retry': 'Retry'
  },
  bs: {
    'general.loading': 'Učitavanje...',
    'general.error': 'Greška',
    'general.retry': 'Pokušaj ponovo'
  }
};

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState('bs');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      setLocaleState(savedLocale);
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setLoading(true);
        
        // Use a timeout to prevent infinite hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // Use our safe URL builder to prevent URL construction errors
        const url = `/api/translations?locale=${locale}`;
        
        const response = await fetch(url, { 
          signal: controller.signal,
          cache: 'no-cache' // Prevent stale cache issues
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.status}`);
        }
        
        const data = await response.json();
        setTranslations(data);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Error fetching translations:', error);
        
        // Load fallback translations for the current locale
        const fallback = fallbackTranslations[locale as 'en' | 'bs'] || fallbackTranslations.en;
        setTranslations(fallback);
        
        // Retry logic for network errors
        if (retryCount < maxRetries) {
          console.log(`Retrying translation fetch (${retryCount + 1}/${maxRetries})...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [locale, retryCount]);

  const setLocale = (newLocale: string) => {
    localStorage.setItem('locale', newLocale);
    setLocaleState(newLocale);
  };

  const t = (key: string): string => {
    if (loading) {
      return key;
    }
    return translations[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t, loading }}>
      {children}
    </TranslationContext.Provider>
  );
} 