"use client";

import React from 'react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function DashboardCard({ title, description, icon }: DashboardCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-transform transform hover:scale-105 cursor-pointer">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 