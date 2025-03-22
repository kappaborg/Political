"use client";

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/components/TranslationProvider';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

const adminTranslations = {
  en: {
    'admin.title': 'Municipality Admin',
    'admin.signedInAs': 'Signed in as',
    'admin.signOut': 'Sign out'
  },
  bs: {
    'admin.title': 'Administrator Općine',
    'admin.signedInAs': 'Prijavljeni kao',
    'admin.signOut': 'Odjavi se'
  }
};

export default function AdminHeader() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const { locale } = useTranslation();

  // Admin paneli için çeviriler
  const t = (key: string): string => {
    return adminTranslations[locale as 'en' | 'bs']?.[key] || adminTranslations.en[key] || key;
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">{t('admin.title')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {session?.user && (
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex max-w-xs items-center rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {session.user.name?.[0] || 'U'}
                    </div>
                  </button>
                </div>

                {showDropdown && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium text-blue-700">{t('admin.signedInAs')}</div>
                      <div className="truncate">{session.user.name}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('admin.signOut')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 