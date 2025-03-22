import { getAuthOptions } from '@/app/api/auth/[...nextauth]/route';
import ActivitiesManager from '@/components/admin/ActivitiesManager';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Aktivite Yönetimi | Admin Paneli',
  description: 'Aktiviteleri ekle, güncelle ve yönet',
};

export default async function ActivitiesManagementPage() {
  const session = await getServerSession(getAuthOptions());
  
  // Oturum yoksa veya admin değilse ana sayfaya yönlendir
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }
  
  return <ActivitiesManager />;
} 