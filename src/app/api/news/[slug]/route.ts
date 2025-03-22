import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    // MongoDB'ye bağlan
    await connectToDatabase();
    
    // İstenen dildeki haberi bul
    const newsItem = await News.findOne({ slug, locale });
    
    if (!newsItem) {
      return NextResponse.json(
        { error: 'Haber bulunamadı' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(newsItem);
  } catch (error) {
    console.error('Haber detayı alınırken hata:', error);
    return NextResponse.json(
      { error: 'Haber detayı alınamadı' }, 
      { status: 500 }
    );
  }
} 