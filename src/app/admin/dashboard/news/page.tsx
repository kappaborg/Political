import NewsManager from '@/components/admin/NewsManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News Management | Admin Dashboard',
  description: 'Manage news articles for the Municipality Portal'
};

export default function NewsManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">News Management</h1>
      </div>
      
      <p className="text-gray-600">
        Add, edit, or remove news articles from your website. Changes will be immediately reflected on the website.
      </p>
      
      <NewsManager />
    </div>
  );
} 