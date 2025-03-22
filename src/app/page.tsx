"use client";

import Carousel from '@/components/Carousel';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MainContent from '@/components/MainContent';
import MunicipalServices from '@/components/MunicipalServices';
import ServiceActivities from '@/components/ServiceActivities';
import { useTranslation } from '@/components/TranslationProvider';

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <Carousel />
      <MunicipalServices />
      <ServiceActivities />
      <MainContent />
      <Footer />
    </>
  );
} 