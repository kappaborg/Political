"use client";

import { useTranslation } from '@/components/TranslationProvider';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const pathname = usePathname();
  
  // Admin panelde olup olmadığımızı kontrol et
  const isAdmin = pathname?.includes('/admin');

  return (
    <div className={`flex items-center rounded-full px-4 py-1.5 ${
      isAdmin 
        ? 'bg-gray-100 border border-gray-200' 
        : 'bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg'
    }`}>
      <button
        onClick={() => setLocale('en')}
        className={`font-medium px-3 py-1.5 rounded-full transition-all duration-300 ${
          locale === 'en' 
            ? 'text-white bg-[#FFB81C] shadow-sm font-semibold' 
            : isAdmin 
              ? 'text-gray-700 hover:bg-gray-200'
              : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
      >
        ENG
      </button>
      <span className={isAdmin ? 'text-gray-400 mx-2' : 'text-white/50 mx-2'}>|</span>
      <button
        onClick={() => setLocale('bs')}
        className={`font-medium px-3 py-1.5 rounded-full transition-all duration-300 ${
          locale === 'bs' 
            ? 'text-white bg-[#FFB81C] shadow-sm font-semibold' 
            : isAdmin 
              ? 'text-gray-700 hover:bg-gray-200'
              : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
      >
        BOS
      </button>
    </div>
  );
} 