import { promises as fsPromises } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  description: string;
}

const carouselFilePath = path.join(process.cwd(), 'data/json/carousel.json');

// JSON dosyasından carousel oku
async function readCarouselFile(): Promise<Record<string, CarouselSlide[]>> {
  try {
    const data = await fsPromises.readFile(carouselFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading carousel file:', error);
    return { en: [], bs: [] };
  }
}

// JSON dosyasına carousel yaz
async function writeCarouselFile(carouselData: Record<string, CarouselSlide[]>): Promise<boolean> {
  try {
    await fsPromises.writeFile(carouselFilePath, JSON.stringify(carouselData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing carousel file:', error);
    return false;
  }
}

// Tüm carousel slaytlarını getir
export async function getCarouselSlides(locale: string = 'en'): Promise<CarouselSlide[]> {
  const carouselData = await readCarouselFile();
  return carouselData[locale] || carouselData.en || [];
}

// ID'ye göre carousel slaytı getir
export async function getCarouselSlideById(id: string, locale: string = 'en'): Promise<CarouselSlide | undefined> {
  const slides = await getCarouselSlides(locale);
  return slides.find(slide => slide.id === id);
}

// Yeni carousel slaytı ekle
export async function addCarouselSlide(slide: Omit<CarouselSlide, 'id'>, locale: string = 'en'): Promise<CarouselSlide> {
  const carouselData = await readCarouselFile();
  
  const newSlide: CarouselSlide = {
    id: uuidv4(),
    ...slide
  };
  
  // Dil için array yoksa oluştur
  if (!carouselData[locale]) {
    carouselData[locale] = [];
  }
  
  carouselData[locale].push(newSlide);
  await writeCarouselFile(carouselData);
  
  return newSlide;
}

// Carousel slaytını güncelle
export async function updateCarouselSlide(id: string, updatedFields: Partial<CarouselSlide>, locale: string = 'en'): Promise<boolean> {
  const carouselData = await readCarouselFile();
  
  if (!carouselData[locale]) {
    return false;
  }
  
  const slideIndex = carouselData[locale].findIndex(slide => slide.id === id);
  
  if (slideIndex === -1) {
    return false;
  }
  
  carouselData[locale][slideIndex] = {
    ...carouselData[locale][slideIndex],
    ...updatedFields
  };
  
  return writeCarouselFile(carouselData);
}

// Carousel slaytını sil
export async function deleteCarouselSlide(id: string, locale: string = 'en'): Promise<boolean> {
  const carouselData = await readCarouselFile();
  
  if (!carouselData[locale]) {
    return false;
  }
  
  const initialLength = carouselData[locale].length;
  carouselData[locale] = carouselData[locale].filter(slide => slide.id !== id);
  
  if (carouselData[locale].length === initialLength) {
    return false; // Hiçbir slayt silinmedi
  }
  
  return writeCarouselFile(carouselData);
}

// Carousel slaytlarının sırasını değiştir
export async function reorderCarouselSlides(newOrder: string[], locale: string = 'en'): Promise<boolean> {
  const carouselData = await readCarouselFile();
  
  if (!carouselData[locale]) {
    return false;
  }
  
  // Tüm slaytların mevcut olduğundan emin ol
  const currentSlides = carouselData[locale];
  const allSlidesExist = newOrder.every(id => currentSlides.some(slide => slide.id === id));
  
  if (!allSlidesExist || newOrder.length !== currentSlides.length) {
    return false;
  }
  
  // Slaytları yeni sıraya göre sırala
  carouselData[locale] = newOrder.map(id => currentSlides.find(slide => slide.id === id)!);
  
  return writeCarouselFile(carouselData);
} 