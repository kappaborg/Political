"use client";

import { useSettings } from '@/components/SettingsProvider';
import { useTranslation } from '@/components/TranslationProvider';
import Link from 'next/link';
import { FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">{settings.siteName}</h3>
            <p className="text-gray-300 mb-4">
              {settings.siteDescription}
            </p>
            <div className="flex space-x-4">
              {settings.socialMedia?.facebook && (
                <a href={settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition-colors">
                  <FaFacebook className="w-5 h-5" />
                </a>
              )}
              {settings.socialMedia?.twitter && (
                <a href={settings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition-colors">
                  <FaTwitter className="w-5 h-5" />
                </a>
              )}
              {settings.socialMedia?.instagram && (
                <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition-colors">
                  <FaInstagram className="w-5 h-5" />
                </a>
              )}
              {settings.socialMedia?.youtube && (
                <a href={settings.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition-colors">
                  <FaYoutube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  {t('header.home')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  {t('header.about')}
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
                  {t('news.title')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  {t('header.services')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  {t('header.contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.social')}</h3>
            <ul className="space-y-3">
              {settings.address && (
                <li className="flex items-start">
                  <FaMapMarkerAlt className="w-5 h-5 text-accent mr-3 mt-1" />
                  <span className="text-gray-300">{settings.address}</span>
                </li>
              )}
              {settings.contactPhone && (
                <li className="flex items-center">
                  <FaPhone className="w-5 h-5 text-accent mr-3" />
                  <span className="text-gray-300">{settings.contactPhone}</span>
                </li>
              )}
              {settings.contactEmail && (
                <li className="flex items-center">
                  <FaEnvelope className="w-5 h-5 text-accent mr-3" />
                  <span className="text-gray-300">{settings.contactEmail}</span>
                </li>
              )}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter to receive updates and news.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                style={{ borderColor: settings.accentColor }}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                style={{ backgroundColor: settings.accentColor }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>{t('footer.copyright').replace('2023', currentYear.toString())}</p>
        </div>
      </div>
    </footer>
  );
} 