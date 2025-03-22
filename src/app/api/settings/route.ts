import connectToDatabase from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import { authOptions } from '../auth/auth-options';

// Geçiş dönemi için - eski JSON verileri MongoDB'ye aktarabilmek için
const dataFilePath = path.join(process.cwd(), 'data/json/settings.json');

export async function GET(request: Request) {
  try {
    // URL'den locale parametresini al
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    // MongoDB'ye bağlan
    await connectToDatabase();
    
    // Verileri MongoDB'den getir
    let settings = await Settings.findOne({ locale });
    
    // Veri bulunamazsa, JSON dosyasından bir kereliğine veri yükle
    if (!settings) {
      try {
        // JSON dosyasını oku
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        
        // JSON verilerini MongoDB'ye aktar
        if (data[locale]) {
          const settingsData = data[locale];
          
          // Sosyal medya verilerini düzenle
          const socialMedia = {
            facebook: settingsData.socialMedia?.facebook || '',
            twitter: settingsData.socialMedia?.twitter || '',
            instagram: settingsData.socialMedia?.instagram || '',
            youtube: settingsData.socialMedia?.youtube || ''
          };
          
          // Settings kaydet
          settings = await Settings.create({
            siteName: settingsData.siteName || 'Municipality Portal',
            siteDescription: settingsData.siteDescription || 'Official website of the Municipality.',
            contactEmail: settingsData.contactEmail || '',
            contactPhone: settingsData.contactPhone || '',
            address: settingsData.address || '',
            socialMedia,
            logo: settingsData.logo || '/images/logo-placeholder.png',
            primaryColor: settingsData.primaryColor || '#2563eb',
            accentColor: settingsData.accentColor || '#0891b2',
            locale
          });
        } else {
          // Varsayılan ayarları oluştur
          settings = await Settings.create({
            siteName: 'Municipality Portal',
            siteDescription: 'Official website of the Municipality.',
            contactEmail: '',
            contactPhone: '',
            address: '',
            socialMedia: {
              facebook: '',
              twitter: '',
              instagram: '',
              youtube: ''
            },
            logo: '/images/logo-placeholder.png',
            primaryColor: '#2563eb',
            accentColor: '#0891b2',
            locale
          });
        }
      } catch (error) {
        console.error('JSON veri içe aktarma hatası:', error);
      }
    }
    
    return NextResponse.json(settings);
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

    // MongoDB'ye bağlan
    await connectToDatabase();

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
    
    // Sosyal medya alanlarını biçimlendir
    const socialMedia = {
      facebook: formData.get('socialMedia.facebook')?.toString() || '',
      twitter: formData.get('socialMedia.twitter')?.toString() || '',
      instagram: formData.get('socialMedia.instagram')?.toString() || '',
      youtube: formData.get('socialMedia.youtube')?.toString() || ''
    };
    
    // Yeni ayarları oluştur
    const settingsData = {
      siteName: formData.get('siteName')?.toString() || '',
      siteDescription: formData.get('siteDescription')?.toString() || '',
      contactEmail: formData.get('contactEmail')?.toString() || '',
      contactPhone: formData.get('contactPhone')?.toString() || '',
      address: formData.get('address')?.toString() || '',
      socialMedia,
      logo: logoPath,
      primaryColor: formData.get('primaryColor')?.toString() || '#2563eb',
      accentColor: formData.get('accentColor')?.toString() || '#0891b2',
      locale
    };
    
    // Ayarları güncelle veya oluştur
    let savedSettings = await Settings.findOneAndUpdate(
      { locale },
      settingsData,
      { new: true, upsert: true }
    );
    
    // Görsel ayarları diğer dil için de güncelle
    const otherLocale = locale === 'en' ? 'bs' : 'en';
    await Settings.findOneAndUpdate(
      { locale: otherLocale },
      {
        logo: logoPath,
        primaryColor: settingsData.primaryColor,
        accentColor: settingsData.accentColor,
        socialMedia
      },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ayarlar başarıyla kaydedildi',
      data: savedSettings 
    });
  } catch (error: any) {
    console.error('Ayar kayıt hatası:', error);
    return NextResponse.json(
      { error: `Ayarlar kaydedilirken hata oluştu: ${error.message}` }, 
      { status: 500 }
    );
  }
} 