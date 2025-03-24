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

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState('bs');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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
        const response = await fetch(`/api/translations?locale=${locale}`);
        if (!response.ok) {
          throw new Error('Failed to fetch translations');
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Error fetching translations:', error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [locale]);

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