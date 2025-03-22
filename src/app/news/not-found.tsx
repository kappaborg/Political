import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { TranslationProvider } from '@/components/TranslationProvider';
import Link from 'next/link';

export default function NewsNotFound() {
  return (
    <TranslationProvider>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        
        <main className="flex-grow py-16">
          <div className="container-custom text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-5xl font-bold text-gray-800 mb-6">404</h1>
              <h2 className="text-3xl font-bold text-gray-700 mb-4">News Article Not Found</h2>
              <p className="text-xl text-gray-600 mb-8">
                The news article you are looking for does not exist or may have been removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/news" 
                  className="inline-flex items-center justify-center bg-[#1d4289] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0c2c64] transition-colors"
                >
                  Browse All News
                </Link>
                <Link 
                  href="/" 
                  className="inline-flex items-center justify-center border border-[#1d4289] text-[#1d4289] px-6 py-3 rounded-lg font-medium hover:bg-[#1d4289] hover:text-white transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </TranslationProvider>
  );
} 