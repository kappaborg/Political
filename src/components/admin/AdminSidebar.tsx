"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FiFileText, FiHome, FiLayers, FiSettings, FiX } from 'react-icons/fi';

type Props = {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
};

export default function AdminSidebar({ isSidebarOpen, closeSidebar }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = searchParams.get('locale') || 'en';
  
  // Get current admin path without locale
  const currentPath = pathname;
  
  // Navigation items
  const navItems = [
    {
      name: locale === 'en' ? 'Dashboard' : 'Gösterge Paneli',
      href: '/admin',
      icon: FiHome
    },
    {
      name: locale === 'en' ? 'Carousel' : 'Slayt Gösterisi',
      href: '/admin/carousel',
      icon: FiLayers
    },
    {
      name: locale === 'en' ? 'News' : 'Haberler',
      href: '/admin/news',
      icon: FiFileText
    },
    {
      name: locale === 'en' ? 'Activities' : 'Etkinlikler',
      href: '/admin/activities',
      icon: FiLayers
    },
    {
      name: locale === 'en' ? 'Settings' : 'Ayarlar',
      href: '/admin/settings',
      icon: FiSettings
    }
  ];
  
  // Function to check if a link is active
  const isActive = (href: string) => {
    if (href === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(href);
  };
  
  // Generate full URL with locale parameter
  const getFullUrl = (href: string) => {
    return `${href}?locale=${locale}`;
  };
  
  return (
    <div className={`
      lg:block fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
      transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="flex h-16 items-center justify-between lg:justify-center px-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {locale === 'en' ? 'Admin Panel' : 'Yönetim Paneli'}
        </h2>
        <button
          onClick={closeSidebar}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="mt-5 px-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={getFullUrl(item.href)}
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-md
              ${isActive(item.href)
                ? 'bg-blue-700 text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            <item.icon
              className={`flex-shrink-0 mr-3 h-5 w-5 ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
} 