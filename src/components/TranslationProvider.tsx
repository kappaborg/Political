"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Locale = 'en' | 'bs';

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => any;
}

const translations = {
  en: {
    'logo': 'Novi Grad Sarajevo',
    'header.home': 'Home',
    'header.about': 'About',
    'header.services': 'Services',
    'header.contact': 'Contact',
    'menu': {
      home: 'Home',
      news: 'News',
      admin: 'Admin',
      dashboard: 'Dashboard',
      carousel: 'Carousel',
      settings: 'Settings',
      activities: 'Activities'
    },
    'menu.home': 'Home',
    'menu.news': 'News',
    'menu.activities': 'Activities',
    'menu.contact': 'Contact',
    'lang.en': 'EN',
    'lang.bs': 'BS',
    
    'carousel.slide1.title': 'Welcome to Novi Grad Sarajevo',
    'carousel.slide1.description': 'A modern municipality committed to serving its citizens with excellence',
    'carousel.slide2.title': 'Improving Our Community',
    'carousel.slide2.description': 'Building a better future through sustainable development and innovation',
    'carousel.slide3.title': 'Discover Our Beautiful District',
    'carousel.slide3.description': 'Experience the unique blend of culture, history, and modern urban living',
    
    'main.news.title': 'Latest News & Updates',
    'main.news.subtitle': 'Stay informed about the latest developments in our municipality',
    'main.news.readMore': 'Read More',
    'main.news.allNews': 'View All News',
    
    'news.title': 'News & Updates',
    'news.back': 'Back to Home',
    'news.notFound': 'News article not found',
    'news.notFoundDesc': 'The news article you are looking for does not exist or has been moved.',
    'news.returnHome': 'Return to Homepage',
    
    'highlights.services.title': 'Municipal Services',
    'highlights.services.description': 'Access a wide range of municipal services including permits, registrations, and more',
    'highlights.events.title': 'Events Calendar',
    'highlights.events.description': 'Stay updated with local events, council meetings, and community gatherings',
    'highlights.projects.title': 'Development Projects',
    'highlights.projects.description': 'Learn about ongoing and upcoming infrastructure and community development projects',
    
    'activities': {
      title: 'Activities',
      subtitle: 'Upcoming and ongoing activities',
      noActivities: 'No activities found',
      ongoing: 'Ongoing',
      viewAll: 'View All Activities',
      readMore: 'Read More',
      ongoingActivities: 'Ongoing Activities',
      upcomingActivities: 'Upcoming Activities',
      pastActivities: 'Past Activities',
      errorMessage: 'Could not load the requested activity. Please try again later or browse all activities.',
      backToList: 'Back to Activities',
      activityNotFound: 'Activity not found',
      shareActivity: 'Share this activity:',
      loadMore: 'Load More',
      pageTitle: 'Activities',
      pageDescription: 'Browse all our activities and join us'
    },
    
    serviceActivities: {
      monthlyTitle: 'Monthly Activities',
      yearlyTitle: 'Yearly Activities',
      monthlyDescription: 'Stay updated with our current month activities and events',
      yearlyDescription: 'View our annual planning and long-term initiatives',
      monthlyTab: 'Monthly Activities',
      yearlyTab: 'Yearly Activities',
      details: 'Details',
      viewAll: 'View All',
      activities: 'Activities'
    },
    
    'footer.address': 'Bulevar Nezavisnosti 19, 71000 Sarajevo',
    'footer.phone': 'Phone: +387 33 123 456',
    'footer.email': 'Email: info@novigradsarajevo.ba',
    'footer.copyright': '© 2023 Novi Grad Sarajevo Municipality. All rights reserved.',
    'footer.quickLinks': 'Quick Links',
    'footer.social': 'Connect With Us',
  },
  bs: {
    'logo': 'Novi Grad Sarajevo',
    'header.home': 'Početna',
    'header.about': 'O nama',
    'header.services': 'Usluge',
    'header.contact': 'Kontakt',
    'menu': {
      home: 'Početna',
      news: 'Vijesti',
      admin: 'Admin',
      dashboard: 'Kontrolna Ploča',
      carousel: 'Carousel',
      settings: 'Postavke',
      activities: 'Aktivnosti'
    },
    'menu.home': 'Početna',
    'menu.news': 'Vijesti',
    'menu.activities': 'Aktivnosti',
    'menu.contact': 'Kontakt',
    'lang.en': 'EN',
    'lang.bs': 'BS',
    
    'carousel.slide1.title': 'Dobrodošli u Novi Grad Sarajevo',
    'carousel.slide1.description': 'Moderna općina posvećena služenju svojim građanima s izvrsnosti',
    'carousel.slide2.title': 'Unapređujemo našu zajednicu',
    'carousel.slide2.description': 'Gradimo bolju budućnost kroz održivi razvoj i inovacije',
    'carousel.slide3.title': 'Otkrijte našu prelijepu općinu',
    'carousel.slide3.description': 'Doživite jedinstvenu mješavinu kulture, historije i modernog urbanog života',
    
    'main.news.title': 'Najnovije vijesti i ažuriranja',
    'main.news.subtitle': 'Ostanite informisani o najnovijim dešavanjima u našoj općini',
    'main.news.readMore': 'Pročitajte više',
    'main.news.allNews': 'Pogledajte sve vijesti',
    
    'news.title': 'Vijesti i ažuriranja',
    'news.back': 'Nazad na početnu',
    'news.notFound': 'Vijest nije pronađena',
    'news.notFoundDesc': 'Vijest koju tražite ne postoji ili je premještena.',
    'news.returnHome': 'Povratak na početnu stranicu',
    
    'highlights.services.title': 'Općinske usluge',
    'highlights.services.description': 'Pristupite širokom spektru općinskih usluga uključujući dozvole, registracije i više',
    'highlights.events.title': 'Kalendar događaja',
    'highlights.events.description': 'Budite u toku sa lokalnim događajima, sjednicama vijeća i okupljanjima zajednice',
    'highlights.projects.title': 'Razvojni projekti',
    'highlights.projects.description': 'Saznajte o tekućim i nadolazećim projektima infrastrukture i razvoja zajednice',
    
    'activities': {
      title: 'Aktivnosti',
      subtitle: 'Nadolazeće i tekuće aktivnosti',
      noActivities: 'Nema pronađenih aktivnosti',
      ongoing: 'U toku',
      viewAll: 'Vidi sve aktivnosti',
      readMore: 'Pročitaj više',
      ongoingActivities: 'Aktivnosti u toku',
      upcomingActivities: 'Nadolazeće aktivnosti',
      pastActivities: 'Prošle aktivnosti',
      errorMessage: 'Nije moguće učitati traženu aktivnost. Molimo pokušajte kasnije ili pregledajte sve aktivnosti.',
      backToList: 'Nazad na aktivnosti',
      activityNotFound: 'Aktivnost nije pronađena',
      shareActivity: 'Podijeli ovu aktivnost:',
      loadMore: 'Učitaj više',
      pageTitle: 'Aktivnosti',
      pageDescription: 'Pregledajte sve naše aktivnosti i pridružite nam se'
    },
    
    serviceActivities: {
      monthlyTitle: 'Mjesečne Aktivnosti',
      yearlyTitle: 'Godišnje Aktivnosti',
      monthlyDescription: 'Ostanite u toku s našim aktivnostima i događajima ovog mjeseca',
      yearlyDescription: 'Pogledajte naše godišnje planiranje i dugoročne inicijative',
      monthlyTab: 'Mjesečne Aktivnosti',
      yearlyTab: 'Godišnje Aktivnosti',
      details: 'Detalji',
      viewAll: 'Vidi sve',
      activities: 'Aktivnosti'
    },
    
    'footer.address': 'Bulevar Nezavisnosti 19, 71000 Sarajevo',
    'footer.phone': 'Telefon: +387 33 123 456',
    'footer.email': 'Email: info@novigradsarajevo.ba',
    'footer.copyright': '© 2023 Općina Novi Grad Sarajevo. Sva prava pridržana.',
    'footer.quickLinks': 'Brzi linkovi',
    'footer.social': 'Povežite se s nama',
  }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('bs');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      if (typeof window !== 'undefined') {
        const savedLocale = localStorage.getItem('locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'bs')) {
          setLocaleState(savedLocale);
        } else {
          // Default to Bosnian if no valid locale is stored
          setLocaleState('bs');
          localStorage.setItem('locale', 'bs');
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // Default to Bosnian on error
      setLocaleState('bs');
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale);
      }
    } catch (error) {
      console.error('Error setting locale in localStorage:', error);
    }
  };

  const t = (key: string): any => {
    // Default language translations
    const defaultTranslations = translations['bs'];
    
    // For debugging
    // console.log(`Translating key: ${key}, current locale: ${locale}`);
    
    if (key.includes('.')) {
      const parts = key.split('.');
      let value: any = translations[locale];
      let defaultValue: any = defaultTranslations;
      
      for (const part of parts) {
        if (!value || typeof value !== 'object') {
          // Try to get from default language
          for (const defaultPart of parts) {
            if (!defaultValue || typeof defaultValue !== 'object') {
              // console.warn(`Translation key not found: ${key}`);
              return key;
            }
            defaultValue = defaultValue[defaultPart];
          }
          return defaultValue !== undefined ? defaultValue : key;
        }
        value = value[part];
      }
      
      return value !== undefined ? value : key;
    } else {
      const value = translations[locale][key as keyof typeof translations[typeof locale]];
      if (value === undefined) {
        const defaultValue = defaultTranslations[key as keyof typeof defaultTranslations];
        return defaultValue !== undefined ? defaultValue : key;
      }
      return value;
    }
  };

  // Use React's suspense boundary to prevent hydration mismatch
  if (typeof window === 'undefined') {
    // Server-side rendering - use default locale
    return (
      <TranslationContext.Provider value={{ locale: 'bs', setLocale, t }}>
        {children}
      </TranslationContext.Provider>
    );
  }

  // When it's server-side or hydration isn't complete, return just the Provider
  if (!isClient) {
    return null;
  }

  // Client-side with hydration complete
  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
} 