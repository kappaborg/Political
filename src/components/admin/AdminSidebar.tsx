"use client";

import { useTranslation } from '@/components/TranslationProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiCalendar, FiFileText, FiHome, FiImage, FiSettings } from 'react-icons/fi';

// Admin menüsü çevirileri için tip tanımları
type AdminMenuKey = 'menu.dashboard' | 'menu.news' | 'menu.carousel' | 'menu.activities' | 'menu.settings';
type AdminMenuTranslations = {
  [locale in 'en' | 'bs']: {
    [key in AdminMenuKey]: string;
  }
};

const adminMenuTranslations: AdminMenuTranslations = {
  en: {
    'menu.dashboard': 'Dashboard',
    'menu.news': 'News',
    'menu.carousel': 'Carousel',
    'menu.activities': 'Activities',
    'menu.settings': 'Settings'
  },
  bs: {
    'menu.dashboard': 'Nadzorna ploča',
    'menu.news': 'Vijesti',
    'menu.carousel': 'Karusel',
    'menu.activities': 'Aktivnosti',
    'menu.settings': 'Postavke'
  }
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const { locale } = useTranslation();

  // Admin menüsü için çeviriler
  const t = (key: AdminMenuKey): string => {
    return adminMenuTranslations[locale as 'en' | 'bs']?.[key] || adminMenuTranslations.en[key] || key;
  };

  const menuItems = [
    {
      name: t('menu.dashboard'),
      href: '/admin/dashboard',
      icon: <FiHome className="mr-3 h-5 w-5" />
    },
    {
      name: t('menu.news'),
      href: '/admin/dashboard/news',
      icon: <FiFileText className="mr-3 h-5 w-5" />
    },
    {
      name: t('menu.carousel'),
      href: '/admin/dashboard/carousel',
      icon: <FiImage className="mr-3 h-5 w-5" />
    },
    {
      name: t('menu.activities'),
      href: '/admin/dashboard/activities',
      icon: <FiCalendar className="mr-3 h-5 w-5" />
    },
    {
      name: t('menu.settings'),
      href: '/admin/dashboard/settings',
      icon: <FiSettings className="mr-3 h-5 w-5" />
    }
  ];

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] bg-white shadow-sm">
      <nav className="mt-5 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={`${item.href}?locale=${locale}`}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
} 