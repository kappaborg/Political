import connectToDatabase from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const setupSecret = searchParams.get('secret');
    
    if (!setupSecret || setupSecret !== process.env.SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Invalid setup secret' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    if (!body.locale || !body.translations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Check if translations for this locale already exist
    const existingTranslation = await Translation.findOne({ locale: body.locale });
    
    if (existingTranslation) {
      // Update existing translations
      existingTranslation.translations = body.translations;
      await existingTranslation.save();
      return NextResponse.json({
        message: 'Translations updated successfully',
        translation: existingTranslation
      });
    }
    
    // Create new translations
    const translation = new Translation({
      locale: body.locale,
      translations: body.translations
    });
    
    await translation.save();
    
    return NextResponse.json({
      message: 'Translations created successfully',
      translation
    });
  } catch (error) {
    console.error('Translation setup error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 