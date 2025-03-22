import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/json/activities.json');

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    // JSON dosyasını oku
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // İstenen dildeki aktiviteyi bul
    const activity = (data[locale] || data.en || []).find(
      (item: any) => item.slug === slug
    );
    
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