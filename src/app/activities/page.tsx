import { Metadata } from 'next';
import ActivitiesPageClient from './ActivitiesPageClient';

export const metadata: Metadata = {
  title: 'Etkinlikler',
  description: 'Yaklaşan ve devam eden etkinliklerimiz'
};

export default async function ActivitiesPage() {
  return <ActivitiesPageClient />;
} 