import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/json/news.json');

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
    
    // İstenen dildeki haberleri al
    const newsItems = data[locale] || data.en || [];
    
    // Slug'a göre haberi bul
    const newsItem = newsItems.find((item: any) => item.slug === slug);
    
    if (!newsItem) {
      return NextResponse.json({ error: 'News item not found' }, { status: 404 });
    }
    
    return NextResponse.json(newsItem);
  } catch (error) {
    console.error('Error reading news item:', error);
    return NextResponse.json({ error: 'Failed to fetch news item' }, { status: 500 });
  }
} 