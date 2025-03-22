import DashboardCard from '@/components/admin/DashboardCard';
import { Metadata } from 'next';
import Link from 'next/link';
import { FiFileText, FiImage, FiSettings } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Municipality Portal',
  description: 'Admin dashboard for the Municipality Portal'
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <p className="text-gray-600">
        Welcome to the Municipality Portal admin panel. Use the dashboard to manage your website content.
      </p>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/dashboard/news">
          <DashboardCard 
            title="Manage News" 
            description="Add, edit or remove news articles from your website." 
            icon={<FiFileText className="h-8 w-8 text-accent-dark" />} 
          />
        </Link>
        
        <Link href="/admin/dashboard/carousel">
          <DashboardCard 
            title="Manage Carousel" 
            description="Update the carousel slides on your homepage." 
            icon={<FiImage className="h-8 w-8 text-accent-dark" />} 
          />
        </Link>
        
        <Link href="/admin/dashboard/settings">
          <DashboardCard 
            title="Settings" 
            description="Configure general website settings." 
            icon={<FiSettings className="h-8 w-8 text-accent-dark" />} 
          />
        </Link>
      </div>
    </div>
  );
} 