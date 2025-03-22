"use client";

import { useSettings } from '@/components/SettingsProvider';
import { useTranslation } from '@/components/TranslationProvider';
import Image from 'next/image';
import Link from 'next/link';
import { FiSettings } from 'react-icons/fi';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  
  // Eski logo URL'si - ayarlardan gelen değer yerine kullan
  const logoUrl = "https://www.novigradsarajevo.ba/wp-content/uploads/2022/05/opcina-novi-grad-sarajevo-mobilna-yellow-line.svg";
  
  return (
    <header className="bg-gradient-to-r from-[#1d4289] to-[#0c2c64] shadow-md">
      <div className="container-custom flex flex-col sm:flex-row items-center py-4">
        {/* Boş sol bölüm - sadece flex düzeni için */}
        <div className="hidden sm:block sm:w-1/4"></div>
        
        {/* Ortadaki logo - hem mobilde hem desktop görünümünde ortada */}
        <div className="flex-grow flex justify-center items-center mb-3 sm:mb-0">
          <Link href="/" className="flex items-center justify-center">
            <Image 
              src={logoUrl}
              alt={settings.siteName || "Municipality Portal"}
              width={180}
              height={60}
              priority
              className="h-12 sm:h-16 w-auto"
            />
          </Link>
        </div>
        
        {/* Sağ menü */}
        <div className="sm:w-1/4 flex justify-center sm:justify-end items-center space-x-4">
          <Link 
            href="/admin/login" 
            className="text-white text-sm flex items-center hover:text-gray-200 transition-colors"
          >
            <FiSettings className="mr-1" />
            <span>Admin</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
      
      {/* Mobil menü - sadece küçük ekranlarda görünür */}
      <div className="sm:hidden bg-[#0c2c64] py-2">
        <div className="container-custom flex justify-center space-x-6">
          {/* Mobile navigation buttons removed */}
        </div>
      </div>
    </header>
  );
} 