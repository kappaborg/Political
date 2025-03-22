import CarouselManager from '@/components/admin/CarouselManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carousel Management | Admin Dashboard',
  description: 'Manage carousel slides for the Municipality Portal'
};

export default function CarouselManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Carousel Management</h1>
      </div>
      
      <p className="text-gray-600">
        Manage the carousel slides that appear on the homepage. Add new slides, edit existing ones, or change their order.
      </p>
      
      <CarouselManager />
    </div>
  );
} 