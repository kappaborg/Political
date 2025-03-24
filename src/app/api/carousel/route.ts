import connectToDatabase from '@/lib/mongodb';
import Carousel from '@/models/Carousel';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import { authOptions } from '../auth/auth-options';

// Geçiş dönemi için - eski JSON verileri MongoDB'ye aktarabilmek için
const dataFilePath = path.join(process.cwd(), 'data/json/carousel.json');

// Carousel verilerini getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    await connectToDatabase();
    
    const slides = await Carousel.find({ locale }).sort({ order: 1 });
    
    return NextResponse.json(slides);
  } catch (error) {
    console.error('Carousel fetch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Yeni Carousel verisi ekle veya mevcut olanı güncelle
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

    const slide = await Carousel.create(data);
    return NextResponse.json(slide);
  } catch (error) {
    console.error('Carousel create error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Carousel sıralamasını güncelle
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, ...updateData } = data;
    
    await connectToDatabase();

    const slide = await Carousel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!slide) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Carousel update error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Carousel öğesi sil
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

    const slide = await Carousel.findByIdAndDelete(id);

    if (!slide) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Carousel delete error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 