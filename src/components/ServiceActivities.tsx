"use client";

import { useTranslation } from '@/components/TranslationProvider';
import { format } from 'date-fns';
import { useState } from 'react';

type Period = 'monthly' | 'yearly';

interface ActivityItem {
  id: number;
  title: string;
  description: string;
  date: string;
  period: Period;
}

// Örnek aktivite öğeleri
const activityItems: ActivityItem[] = [
  {
    id: 1,
    title: 'Road Maintenance Update',
    description: 'Monthly update on ongoing road maintenance projects throughout the municipality.',
    date: '2023-04-15',
    period: 'monthly',
  },
  {
    id: 2,
    title: 'Community Event Schedule',
    description: 'This month\'s schedule for community events, including workshops and public meetings.',
    date: '2023-04-10',
    period: 'monthly',
  },
  {
    id: 3,
    title: 'Public Transportation Changes',
    description: 'Monthly update on changes to public transportation routes and schedules.',
    date: '2023-04-05',
    period: 'monthly',
  },
  {
    id: 4,
    title: 'Annual Budget Report',
    description: 'Yearly report on the municipality\'s budget allocation and expenditure.',
    date: '2023-02-20',
    period: 'yearly',
  },
  {
    id: 5,
    title: 'Development Plan',
    description: 'Annual update on the municipality\'s long-term development and infrastructure plans.',
    date: '2023-01-15',
    period: 'yearly',
  },
];

export default function ServiceActivities() {
  const { t } = useTranslation();
  const [activePeriod, setActivePeriod] = useState<Period>('monthly');

  const filteredActivities = activityItems.filter(item => item.period === activePeriod);

  // Tarih formatla
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return '';
      }
      return format(date, 'dd.MM.yyyy');
    } catch (e) {
      console.error('Date formatting error:', e);
      return '';
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            {activePeriod === 'monthly' 
              ? 'Monthly Activities'
              : 'Yearly Activities'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {activePeriod === 'monthly' 
              ? 'Stay updated with our current month activities and events'
              : 'View our annual planning and long-term initiatives'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex bg-gray-50">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 ${
                activePeriod === 'monthly' 
                  ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
              }`}
              onClick={() => setActivePeriod('monthly')}
            >
              Monthly Activities
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 ${
                activePeriod === 'yearly' 
                  ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
              }`}
              onClick={() => setActivePeriod('yearly')}
            >
              Yearly Activities
            </button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredActivities.map(item => (
              <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">{item.title}</h3>
                  <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {formatDate(item.date)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                <div className="flex justify-end">
                  <button className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center transition-colors">
                    <span>Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gray-50 text-center">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium">
              View All {activePeriod === 'monthly' ? 'Monthly' : 'Yearly'} Activities
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 