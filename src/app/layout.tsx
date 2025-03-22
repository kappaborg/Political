import { SettingsProvider } from '@/components/SettingsProvider';
import { TranslationProvider } from '@/components/TranslationProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Općina Portal',
  description: 'Općina Portal - Vaš centar za informacije',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TranslationProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </TranslationProvider>
      </body>
    </html>
  );
} 