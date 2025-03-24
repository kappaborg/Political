import connectToDatabase from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/auth-options';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    await connectToDatabase();
    
    let settings = await Settings.findOne({ locale });
    
    if (!settings) {
      // Varsayılan ayarları oluştur
      settings = await Settings.create({
        locale,
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
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
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

    const { locale } = data;
    
    const settings = await Settings.findOneAndUpdate(
      { locale },
      { ...data },
      { new: true, upsert: true }
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 