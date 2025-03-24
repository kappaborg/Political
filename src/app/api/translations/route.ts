import connectToDatabase from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'bs';
    
    await connectToDatabase();
    
    const translation = await Translation.findOne({ locale });
    
    if (!translation) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(translation.translations);
  } catch (error) {
    console.error('Translation fetch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 