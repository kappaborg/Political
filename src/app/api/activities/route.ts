import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import { authOptions } from '../auth/[...nextauth]/route';

const dataFilePath = path.join(process.cwd(), 'data/json/activities.json');

export async function GET(request: Request) {
  try {
    // URL'den locale parametresini al
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    // JSON dosyasını oku
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // İstenen dildeki aktiviteleri döndür
    return NextResponse.json(data[locale] || data.en || []);
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

    // JSON dosyasını oku
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Yeni aktivite öğesi oluştur
    const activityItem = {
      id: formData.get('id')?.toString() || Date.now().toString(),
      slug: formData.get('slug')?.toString() || '',
      title: formData.get('title')?.toString() || '',
      excerpt: formData.get('summary')?.toString() || '',
      content: formData.get('content')?.toString() || '',
      image: imagePath,
      date: formData.get('date')?.toString() || new Date().toISOString().split('T')[0],
      location: formData.get('location')?.toString() || '',
      startTime: formData.get('startTime')?.toString() || '',
      endTime: formData.get('endTime')?.toString() || '',
      isOngoing: formData.get('isOngoing') === 'true'
    };
    
    // Desteklenen tüm diller
    const supportedLocales = ['en', 'bs'];
    
    // Tüm diller için işlem yap
    supportedLocales.forEach(currentLocale => {
      // Eğer dil için bir array yoksa oluştur
      if (!data[currentLocale]) {
        data[currentLocale] = [];
      }
      
      // ID varsa güncelle, yoksa ekle
      const existingItemIndex = data[currentLocale].findIndex(
        (item: any) => item.id === activityItem.id
      );
      
      if (existingItemIndex >= 0) {
        // Var olan aktiviteyi güncelle
        data[currentLocale][existingItemIndex] = activityItem;
      } else {
        // Yeni aktivite ekle
        data[currentLocale].unshift(activityItem);
      }
    });
    
    // Dosyaya geri yaz
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Aktivite başarıyla kaydedildi',
      data: activityItem 
    });
  } catch (error: any) {
    console.error('Aktivite kayıt hatası:', error);
    return NextResponse.json(
      { error: `Aktivite kaydedilirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
}

// PUT metodu - aktivite sıralamasını güncellemek için
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
    
    // JSON dosyasını oku
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Desteklenen tüm diller
    const supportedLocales = ['en', 'bs'];
    
    // Tüm diller için sıralamayı güncelle
    supportedLocales.forEach(currentLocale => {
      // Eğer dil için bir array yoksa oluştur
      if (!data[currentLocale]) {
        data[currentLocale] = [];
        return;
      }
      
      // Mevcut öğeleri ID'ye göre bir haritaya çevir
      const itemMap = new Map();
      data[currentLocale].forEach((item: any) => {
        itemMap.set(item.id, item);
      });
      
      // Yeni sıralamaya göre diziyi oluştur
      // Sadece mevcut ID'ler için
      const reorderedItems = items
        .map((id: string) => itemMap.get(id))
        .filter(Boolean);
      
      // Sıralanmış öğeleri ekle
      data[currentLocale] = reorderedItems;
      
      // Silinmiş olmayan ancak sıralamada gönderilmeyen öğeleri en sona ekle
      data[currentLocale].forEach((item: any) => {
        if (!items.includes(item.id)) {
          reorderedItems.push(item);
        }
      });
    });
    
    // Dosyaya geri yaz
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
    
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

// DELETE metodu - aktivite öğesini silmek için
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
    // URL'den ID parametresini al
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Silinecek öğe ID\'si belirtilmedi' }, 
        { status: 400 }
      );
    }
    
    // JSON dosyasını oku
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Desteklenen tüm diller
    const supportedLocales = ['en', 'bs'];
    let isDeleted = false;
    
    // Tüm diller için silme işlemi yap
    supportedLocales.forEach(locale => {
      if (data[locale]) {
        const initialLength = data[locale].length;
        data[locale] = data[locale].filter((item: any) => item.id !== id);
        
        // En az bir dilde silindi mi kontrol et
        if (data[locale].length < initialLength) {
          isDeleted = true;
        }
      }
    });
    
    if (!isDeleted) {
      return NextResponse.json(
        { error: 'Belirtilen ID\'ye sahip öğe bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Dosyaya geri yaz
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Aktivite öğesi başarıyla silindi' 
    });
  } catch (error: any) {
    console.error('Aktivite silme hatası:', error);
    return NextResponse.json(
      { error: `Aktivite öğesi silinirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
} 