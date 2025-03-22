import connectToDatabase from '@/lib/mongodb';
import Activity from '@/models/Activity';
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
    
    // İstenen dildeki aktiviteyi bul
    const activity = await Activity.findOne({ slug, locale });
    
    if (!activity) {
      return NextResponse.json(
        { error: 'Aktivite bulunamadı' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Aktivite detayı alınırken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite detayı alınamadı' }, 
      { status: 500 }
    );
  }
} 