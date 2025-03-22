import AdminProvider from '@/components/admin/AdminProvider';
import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Admin Panel | Municipality Portal',
  description: 'Admin panel for the Municipality Portal'
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <Toaster position="top-right" />
      {children}
    </AdminProvider>
  );
} 