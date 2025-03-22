"use client";

import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Metadata } from 'next';
import { useState } from 'react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Municipality Portal',
  description: 'Admin dashboard for the Municipality Portal'
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex">
        <AdminSidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 