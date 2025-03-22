import connectToDatabase from '@/lib/mongodb';
import Carousel from '@/models/Carousel';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../auth/auth-options';

// Geçiş dönemi için - eski JSON verileri MongoDB'ye aktarabilmek için
const dataFilePath = path.join(process.cwd(), 'data/json/carousel.json');

// Carousel verilerini getir
export async function GET(request: Request) {
  try {
    // URL'den locale parametresini al
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    // MongoDB'ye bağlan
    await connectToDatabase();
    
    // Verileri MongoDB'den getir
    const slides = await Carousel.find({ locale }).sort({ order: 1 });
    
    // Veri bulunamazsa, JSON dosyasından bir kereliğine veri yükle
    if (slides.length === 0) {
      try {
        // JSON dosyasını oku
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        
        // JSON verilerini MongoDB'ye aktar
        if (data[locale] && data[locale].length > 0) {
          const importPromises = data[locale].map(async (item: any, index: number) => {
            await Carousel.create({
              id: item.id || uuidv4(),
              title: item.title,
              subtitle: item.subtitle,
              image: item.image,
              buttonText: item.buttonText || '',
              buttonLink: item.buttonLink || '#',
              locale,
              order: index
            });
          });
          
          await Promise.all(importPromises);
          
          // Verileri tekrar getir
          const importedSlides = await Carousel.find({ locale }).sort({ order: 1 });
          return NextResponse.json(importedSlides);
        }
      } catch (error) {
        console.error('JSON veri içe aktarma hatası:', error);
      }
    }
    
    return NextResponse.json(slides);
  } catch (error) {
    console.error('Error reading carousel data:', error);
    return NextResponse.json({ error: 'Failed to fetch carousel data' }, { status: 500 });
  }
}

// Yeni Carousel verisi ekle veya mevcut olanı güncelle
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

    console.log('Gelen carousel verileri:', Object.fromEntries(formData.entries()));

    // MongoDB'ye bağlan
    await connectToDatabase();

    // Dosya yükleme işlemi
    let imagePath = formData.get('image')?.toString() || '/images/carousel-placeholder.jpg';
    const imageFile = formData.get('imageFile') as File;
    
    if (imageFile && imageFile instanceof File) {
      try {
        const fileName = `carousel-${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
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
    
    const slideId = formData.get('id')?.toString() || uuidv4();
    
    // Veriyi hazırla
    const carouselItem = {
      id: slideId,
      title: formData.get('title')?.toString() || '',
      subtitle: formData.get('subtitle')?.toString() || '',
      image: imagePath,
      buttonText: formData.get('buttonText')?.toString() || '',
      buttonLink: formData.get('buttonLink')?.toString() || '#',
      locale
    };
    
    // ID varsa güncelle, yoksa ekle
    let savedSlide;
    const existingSlide = await Carousel.findOne({ id: slideId, locale });
    
    if (existingSlide) {
      // Mevcut slide'ı güncelle
      savedSlide = await Carousel.findOneAndUpdate(
        { id: slideId, locale }, 
        carouselItem,
        { new: true }
      );
    } else {
      // Son sırayı bul
      const lastSlide = await Carousel.findOne({ locale }).sort({ order: -1 });
      const order = lastSlide ? lastSlide.order + 1 : 0;
      
      // Yeni slide ekle
      savedSlide = await Carousel.create({
        ...carouselItem,
        order
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Carousel öğesi başarıyla kaydedildi',
      data: savedSlide 
    });
  } catch (error: any) {
    console.error('Carousel kayıt hatası:', error);
    return NextResponse.json(
      { error: `Carousel öğesi kaydedilirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
}

// Carousel sıralamasını güncelle
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
    
    // Her öğeyi sırayla güncelle
    for (let i = 0; i < items.length; i++) {
      await Carousel.findOneAndUpdate(
        { id: items[i], locale },
        { order: i }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Carousel sıralaması başarıyla güncellendi' 
    });
  } catch (error: any) {
    console.error('Carousel sıralama hatası:', error);
    return NextResponse.json(
      { error: `Carousel sıralaması güncellenirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
}

// Carousel öğesi sil
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
    await Carousel.deleteOne({ id, locale });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Carousel öğesi başarıyla silindi' 
    });
  } catch (error: any) {
    console.error('Carousel silme hatası:', error);
    return NextResponse.json(
      { error: `Carousel öğesi silinirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
} 