"use client";

import { useTranslation } from '@/components/TranslationProvider';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

// Carousel slide tipi
interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

const Carousel = () => {
  const { t, locale } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // API'den carousel verilerini al
  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        setIsLoading(true);
        // Önbelleği etkisizleştirmek için timestamp parametresi ekleyin
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/carousel?locale=${locale}&_t=${timestamp}`);
        if (!response.ok) throw new Error('Failed to fetch carousel data');
        const data = await response.json();
        setSlides(data);
        // Yeni slaytlar geldiğinde imagesLoaded durumunu sıfırla
        setImagesLoaded({});
        // Slayt değiştiğinde, ilk slaytı göster
        setCurrentSlide(0);
      } catch (error) {
        console.error('Error fetching carousel data:', error);
        // Hata durumunda varsayılan verileri kullan
        setSlides([
          {
            id: '1',
            image: '/images/municipality-1.jpg',
            title: t('carousel.slide1.title'),
            subtitle: t('carousel.slide1.subtitle'),
          },
          {
            id: '2',
            image: '/images/municipality-2.jpg',
            title: t('carousel.slide2.title'),
            subtitle: t('carousel.slide2.subtitle'),
          },
          {
            id: '3',
            image: '/images/municipality-3.jpg',
            title: t('carousel.slide3.title'),
            subtitle: t('carousel.slide3.subtitle'),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarouselData();
  }, [locale, t]);

  // Görüntü yükleme durumunu izle
  const handleImageLoad = useCallback((id: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [id]: true
    }));
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // Otomatik geçiş için interval
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, slides.length]);

  // Klavye kontrolü için event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] bg-gray-200 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-b-lg shadow-xl">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="relative w-full h-full">
            {/* Düşük kaliteli placeholder görüntü */}
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            
            {/* Ana görüntü */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className={`object-cover transition-opacity duration-500 ${
                imagesLoaded[slide.id] ? 'opacity-100' : 'opacity-0'
              }`}
              priority={index === currentSlide}
              onLoad={() => handleImageLoad(slide.id)}
              loading={index === currentSlide ? "eager" : "lazy"}
              quality={index === currentSlide ? 85 : 60}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{slide.title}</h2>
              {slide.subtitle && <p className="text-lg md:text-xl max-w-3xl mb-4">{slide.subtitle}</p>}
              
              {slide.buttonText && slide.buttonLink && (
                <a 
                  href={slide.buttonLink} 
                  className="inline-block bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-lg font-medium transition-colors mt-2"
                >
                  {slide.buttonText}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Sağ ve sol ok butonları */}
      <button 
        onClick={prevSlide} 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={nextSlide} 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel; 