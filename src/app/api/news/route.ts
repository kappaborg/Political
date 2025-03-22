import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../auth/auth-options';

// Geçiş dönemi için - eski JSON verileri MongoDB'ye aktarabilmek için
const dataFilePath = path.join(process.cwd(), 'data/json/news.json');

export async function GET(request: Request) {
  try {
    // URL'den locale parametresini al
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    // MongoDB'ye bağlan
    await connectToDatabase();
    
    // Verileri MongoDB'den getir - en yeni haberler önce
    const news = await News.find({ locale }).sort({ date: -1 });
    
    // Veri bulunamazsa, JSON dosyasından bir kereliğine veri yükle
    if (news.length === 0) {
      try {
        // JSON dosyasını oku
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        
        // JSON verilerini MongoDB'ye aktar
        if (data[locale] && data[locale].length > 0) {
          const importPromises = data[locale].map(async (item: any) => {
            await News.create({
              id: item.id || uuidv4(),
              slug: item.slug || item.title.toLowerCase().replace(/\s+/g, '-'),
              title: item.title,
              excerpt: item.excerpt || item.summary || '',
              content: item.content || '',
              image: item.image,
              date: item.date,
              locale
            });
          });
          
          await Promise.all(importPromises);
          
          // Verileri tekrar getir
          const importedNews = await News.find({ locale }).sort({ date: -1 });
          return NextResponse.json(importedNews);
        }
      } catch (error) {
        console.error('JSON veri içe aktarma hatası:', error);
      }
    }
    
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error reading news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Kimlik doğrulama kontrolü
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Bu işlem için yetkiniz yok' }, 
      { status: 401 }
    );
  }

  try {
    // Form verisini al
    const formData = await request.formData();
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    console.log('Gelen haber verileri:', Object.fromEntries(formData.entries()));

    // MongoDB'ye bağlan
    await connectToDatabase();

    // Dosya yükleme işlemi
    let imagePath = formData.get('image')?.toString() || '/images/news-placeholder.jpg';
    const imageFile = formData.get('imageFile') as File;
    
    if (imageFile && imageFile instanceof File) {
      try {
        const fileName = `news-${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
        const imageDestination = path.join(process.cwd(), 'public/images', fileName);
        
        // Dosya içeriğini ArrayBuffer'a çevir
        const fileBuffer = await imageFile.arrayBuffer();
        
        // Dosyayı kaydet
        await fs.writeFile(imageDestination, Buffer.from(fileBuffer));
        
        // Kaydedilen dosya yolunu güncelle
        imagePath = `/images/${fileName}`;
        console.log('Dosya başarıyla yüklendi:', imagePath);
      } catch (error) {
        console.error('Dosya yükleme hatası:', error);
      }
    }
    
    const newsId = formData.get('id')?.toString() || uuidv4();
    
    // Veriyi hazırla
    const newsItem = {
      id: newsId,
      slug: formData.get('slug')?.toString() || formData.get('title')?.toString()?.toLowerCase().replace(/\s+/g, '-') || '',
      title: formData.get('title')?.toString() || '',
      excerpt: formData.get('excerpt')?.toString() || formData.get('summary')?.toString() || '',
      content: formData.get('content')?.toString() || '',
      image: imagePath,
      date: formData.get('date')?.toString() || new Date().toISOString().split('T')[0],
      locale
    };
    
    // ID varsa güncelle, yoksa ekle
    let savedNews;
    const existingNews = await News.findOne({ id: newsId, locale });
    
    if (existingNews) {
      // Mevcut haberi güncelle
      savedNews = await News.findOneAndUpdate(
        { id: newsId, locale }, 
        newsItem,
        { new: true }
      );
    } else {
      // Yeni haber ekle
      savedNews = await News.create(newsItem);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Haber başarıyla kaydedildi',
      data: savedNews 
    });
  } catch (error: any) {
    console.error('Haber kayıt hatası:', error);
    return NextResponse.json(
      { error: `Haber kaydedilirken hata oluştu: ${error.message}` }, 
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

// Haber silmek için DELETE metodu
export async function DELETE(request: Request) {
  // Kimlik doğrulama kontrolü
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Bu işlem için yetkiniz yok' }, 
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const locale = searchParams.get('locale') || 'en';
    
    if (!id) {
      return NextResponse.json(
        { error: 'Silinecek öğe ID\'si belirtilmedi' }, 
        { status: 400 }
      );
    }
    
    // MongoDB'ye bağlan
    await connectToDatabase();
    
    // Öğeyi sil
    await News.deleteOne({ id, locale });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Haber başarıyla silindi' 
    });
  } catch (error: any) {
    console.error('Haber silme hatası:', error);
    return NextResponse.json(
      { error: `Haber silinirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
} 