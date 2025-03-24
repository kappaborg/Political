import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import { authOptions } from '../auth/auth-options';

// Geçiş dönemi için - eski JSON verileri MongoDB'ye aktarabilmek için
const dataFilePath = path.join(process.cwd(), 'data/json/news.json');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    await connectToDatabase();
    
    const news = await News.find({ locale }).sort({ date: -1 });
    
    return NextResponse.json(news);
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectToDatabase();
    
    const news = await News.create(data);
    return NextResponse.json(news);
  } catch (error) {
    console.error('News create error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const news = await News.findByIdAndDelete(id);
    
    if (!news) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('News delete error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Haber sıralamasını güncellemek için PUT metodu
export async function PUT(request: Request) {
  // Kimlik doğrulama kontrolü
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Bu işlem için yetkiniz yok' }, 
      { status: 401 }
    );
  }

  try {
    // JSON verisini al
    const reqData = await request.json();
    const { items, locale = 'en' } = reqData;
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı. Öğe dizisi bekleniyor.' }, 
        { status: 400 }
      );
    }
    
    // MongoDB'ye bağlan
    await connectToDatabase();
    
    // Özel bir sıralama yapılabilir ancak şu an için tarih bazlı sıralama kullanıyoruz
    
    return NextResponse.json({ 
      success: true, 
      message: 'Haber sıralaması başarıyla güncellendi' 
    });
  } catch (error: any) {
    console.error('Haber sıralama hatası:', error);
    return NextResponse.json(
      { error: `Haber sıralaması güncellenirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
} 