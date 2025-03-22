import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import { authOptions } from '../auth/auth-options';

const dataFilePath = path.join(process.cwd(), 'data/json/settings.json');

export async function GET(request: Request) {
  try {
    // URL'den locale parametresini al
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    // JSON dosyasını oku
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // İstenen dildeki ayarları döndür
    return NextResponse.json(data[locale] || data.en || {});
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
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

    console.log('Gelen ayar verileri:', Object.fromEntries(formData.entries()));

    // Dosya yükleme işlemi - logo
    let logoPath = formData.get('logo')?.toString() || '/images/logo-placeholder.png';
    const logoFile = formData.get('logoFile') as File;
    
    if (logoFile && logoFile instanceof File) {
      try {
        const fileName = `logo-${Date.now()}-${logoFile.name.replace(/\s+/g, '-')}`;
        const logoDestination = path.join(process.cwd(), 'public/images', fileName);
        
        // Dosya içeriğini ArrayBuffer'a çevir
        const fileBuffer = await logoFile.arrayBuffer();
        
        // Dosyayı kaydet
        await fs.writeFile(logoDestination, Buffer.from(fileBuffer));
        
        // Kaydedilen dosya yolunu güncelle
        logoPath = `/images/${fileName}`;
        console.log('Logo dosyası başarıyla yüklendi:', logoPath);
      } catch (error) {
        console.error('Logo yükleme hatası:', error);
      }
    }
    
    // JSON dosyasını oku
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Sosyal medya alanlarını biçimlendir
    const socialMedia = {
      facebook: formData.get('socialMedia.facebook')?.toString() || '',
      twitter: formData.get('socialMedia.twitter')?.toString() || '',
      instagram: formData.get('socialMedia.instagram')?.toString() || '',
      youtube: formData.get('socialMedia.youtube')?.toString() || ''
    };
    
    // Yeni ayarları oluştur
    const settings = {
      siteName: formData.get('siteName')?.toString() || '',
      siteDescription: formData.get('siteDescription')?.toString() || '',
      contactEmail: formData.get('contactEmail')?.toString() || '',
      contactPhone: formData.get('contactPhone')?.toString() || '',
      address: formData.get('address')?.toString() || '',
      socialMedia,
      logo: logoPath,
      primaryColor: formData.get('primaryColor')?.toString() || '#2563eb',
      accentColor: formData.get('accentColor')?.toString() || '#0891b2'
    };
    
    // Mevcut dil için ayarları güncelle
    data[locale] = {
      ...data[locale],
      ...settings
    };
    
    // Dil bağımsız görsel öğeleri diğer dil için de güncelle
    const otherLocale = locale === 'en' ? 'bs' : 'en';
    data[otherLocale] = {
      ...data[otherLocale],
      logo: logoPath,
      primaryColor: settings.primaryColor,
      accentColor: settings.accentColor,
      socialMedia
    };
    
    // Dosyaya geri yaz
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ayarlar başarıyla kaydedildi',
      data: settings 
    });
  } catch (error: any) {
    console.error('Ayar kayıt hatası:', error);
    return NextResponse.json(
      { error: `Ayarlar kaydedilirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
} 