import connectToDatabase from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { NextRequest, NextResponse } from 'next/server';

// Default fallback translations
const defaultTranslations = {
  bs: {
    'general.loading': 'Učitavanje...',
    'general.error': 'Greška',
    'general.retry': 'Pokušaj ponovo',
    'menu.home': 'Početna',
    'menu.about': 'O nama',
    'menu.services': 'Usluge',
    'menu.news': 'Vijesti',
    'menu.contact': 'Kontakt'
  },
  en: {
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.retry': 'Retry',
    'menu.home': 'Home',
    'menu.about': 'About',
    'menu.services': 'Services',
    'menu.news': 'News',
    'menu.contact': 'Contact'
  }
};

export const dynamic = 'force-dynamic'; // Mark as dynamic to avoid build issues

export async function GET(request: NextRequest) {
  try {
    // Create a timeout promise that rejects after 5 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 5000);
    });

    // Parse the URL with error handling
    let locale = 'bs'; // Default locale
    try {
      locale = request.nextUrl.searchParams.get('locale') || 'bs';
    } catch (error) {
      console.error('Error parsing URL params:', error);
      // Continue with default locale
    }
    
    // Race between DB connection and timeout
    const translationPromise = (async () => {
      try {
        await connectToDatabase();
        const translation = await Translation.findOne({ locale });
        return translation;
      } catch (error) {
        console.error('Translation DB fetch error:', error);
        return null;
      }
    })();

    // Use Promise.race to implement a timeout
    const translation = await Promise.race([translationPromise, timeoutPromise])
      .catch(error => {
        console.error('Translation fetch timed out or failed:', error);
        return null;
      });
    
    // If translation found, return it
    if (translation) {
      return NextResponse.json(translation.translations);
    }
    
    // Return fallback translations
    const fallback = defaultTranslations[locale as 'bs' | 'en'] || defaultTranslations.bs;
    console.log(`Using fallback translations for ${locale}`);
    
    return NextResponse.json(fallback);
  } catch (error) {
    console.error('Translation fetch error:', error);
    
    // Return emergency fallback in case of any errors
    return NextResponse.json(
      defaultTranslations.bs,
      { status: 200 } // Still return 200 to not break the UI
    );
  }
} 