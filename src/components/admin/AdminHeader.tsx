"use client";

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/components/TranslationProvider';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";

// Admin çevirileri için tip tanımları
type AdminTranslationKey = 'admin.title' | 'admin.signedInAs' | 'admin.signOut';
type AdminTranslations = {
  [locale in 'en' | 'bs']: {
    [key in AdminTranslationKey]: string;
  }
};

const adminTranslations: AdminTranslations = {
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

type Props = {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export default function AdminHeader({ toggleSidebar, isSidebarOpen }: Props) {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const { locale } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  // Admin paneli için çeviriler
  const t = (key: AdminTranslationKey): string => {
    return adminTranslations[locale as 'en' | 'bs']?.[key] || adminTranslations.en[key] || key;
  };

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <FiX className="h-5 w-5" />
            ) : (
              <FiMenu className="h-5 w-5" />
            )}
          </button>
          
          <h1 className="ml-2 text-xl font-semibold text-gray-800">{t('admin.title')}</h1>
        </div>
        
        <div className="flex items-center">
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

          {showConfirm ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Are you sure?</span>
              <button
                onClick={confirmLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded"
              >
                Yes
              </button>
              <button
                onClick={cancelLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-sm rounded"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1.5 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 