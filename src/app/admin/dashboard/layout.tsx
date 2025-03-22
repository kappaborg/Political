import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Municipality Portal',
  description: 'Admin dashboard for the Municipality Portal'
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
} 