import connectToDatabase from '@/lib/mongodb';
import Activity from '@/models/Activity';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../auth/auth-options';

// Geçiş dönemi için - eski JSON verileri MongoDB'ye aktarabilmek için
const dataFilePath = path.join(process.cwd(), 'data/json/activities.json');

export async function GET(request: Request) {
  try {
    // URL'den locale parametresini al
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    // MongoDB'ye bağlan
    await connectToDatabase();
    
    // Verileri MongoDB'den getir
    const activities = await Activity.find({ locale }).sort({ startDate: 1 });
    
    // Veri bulunamazsa, JSON dosyasından bir kereliğine veri yükle
    if (activities.length === 0) {
      try {
        // JSON dosyasını oku
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        
        // JSON verilerini MongoDB'ye aktar
        if (data[locale] && data[locale].length > 0) {
          const importPromises = data[locale].map(async (item: any) => {
            // Aktivite durumunu belirle
            const today = new Date();
            const startDate = new Date(item.date || item.startDate);
            const endDate = item.endDate ? new Date(item.endDate) : null;
            
            let status = 'upcoming';
            if (startDate <= today) {
              status = endDate && endDate >= today ? 'ongoing' : 'past';
            }
            
            await Activity.create({
              id: item.id || uuidv4(),
              slug: item.slug || item.title.toLowerCase().replace(/\s+/g, '-'),
              title: item.title,
              excerpt: item.excerpt || item.summary || '',
              content: item.content || '',
              image: item.image,
              startDate: item.date || item.startDate,
              endDate: item.endDate || null,
              status,
              locale
            });
          });
          
          await Promise.all(importPromises);
          
          // Verileri tekrar getir
          const importedActivities = await Activity.find({ locale }).sort({ startDate: 1 });
          return NextResponse.json(importedActivities);
        }
      } catch (error) {
        console.error('JSON veri içe aktarma hatası:', error);
      }
    }
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error reading activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
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

    console.log('Gelen aktivite verileri:', Object.fromEntries(formData.entries()));

    // MongoDB'ye bağlan
    await connectToDatabase();

    // Dosya yükleme işlemi
    let imagePath = formData.get('image')?.toString() || '/images/activity-placeholder.jpg';
    const imageFile = formData.get('imageFile') as File;
    
    if (imageFile && imageFile instanceof File) {
      try {
        const fileName = `activity-${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
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
    
    const activityId = formData.get('id')?.toString() || uuidv4();
    const startDate = formData.get('startDate')?.toString() || formData.get('date')?.toString() || new Date().toISOString().split('T')[0];
    const endDate = formData.get('endDate')?.toString() || null;
    
    // Aktivite durumunu belirle
    const today = new Date();
    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;
    
    let status = 'upcoming';
    if (startDateObj <= today) {
      status = endDateObj && endDateObj >= today ? 'ongoing' : 'past';
    }
    
    // Veriyi hazırla
    const activityItem = {
      id: activityId,
      slug: formData.get('slug')?.toString() || formData.get('title')?.toString()?.toLowerCase().replace(/\s+/g, '-') || '',
      title: formData.get('title')?.toString() || '',
      excerpt: formData.get('excerpt')?.toString() || formData.get('summary')?.toString() || '',
      content: formData.get('content')?.toString() || '',
      image: imagePath,
      startDate,
      endDate,
      status,
      locale
    };
    
    // ID varsa güncelle, yoksa ekle
    let savedActivity;
    const existingActivity = await Activity.findOne({ id: activityId, locale });
    
    if (existingActivity) {
      // Mevcut aktiviteyi güncelle
      savedActivity = await Activity.findOneAndUpdate(
        { id: activityId, locale }, 
        activityItem,
        { new: true }
      );
    } else {
      // Yeni aktivite ekle
      savedActivity = await Activity.create(activityItem);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Aktivite başarıyla kaydedildi',
      data: savedActivity 
    });
  } catch (error: any) {
    console.error('Aktivite kayıt hatası:', error);
    return NextResponse.json(
      { error: `Aktivite kaydedilirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
}

// Aktiviteleri sıralamak için PUT metodu
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
    
    // Burada özel bir sıralama gerekirse yapılabilir
    // Şu an aktiviteler tarih bazlı sıralandığı için özel bir şey yapmıyoruz
    
    return NextResponse.json({ 
      success: true, 
      message: 'Aktivite sıralaması başarıyla güncellendi' 
    });
  } catch (error: any) {
    console.error('Aktivite sıralama hatası:', error);
    return NextResponse.json(
      { error: `Aktivite sıralaması güncellenirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
}

// Aktivite silmek için DELETE metodu
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
    await Activity.deleteOne({ id, locale });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Aktivite başarıyla silindi' 
    });
  } catch (error: any) {
    console.error('Aktivite silme hatası:', error);
    return NextResponse.json(
      { error: `Aktivite silinirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
} 