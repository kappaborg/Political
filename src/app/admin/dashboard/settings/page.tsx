import SettingsManager from '@/components/admin/SettingsManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Admin Dashboard',
  description: 'Configure website settings for the Municipality Portal'
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>
      
      <p className="text-gray-600">
        Configure website settings and preferences. These changes affect how your website functions and appears to visitors.
      </p>
      
      <SettingsManager />
    </div>
  );
} 