"use client";

import { useTranslation } from '@/components/TranslationProvider';
import { FaBuilding, FaCalendarAlt, FaRoad } from 'react-icons/fa';

export default function Highlights() {
  const { t } = useTranslation();
  
  const highlights = [
    {
      id: 1,
      title: t('highlights.services.title'),
      description: t('highlights.services.description'),
      icon: <FaBuilding className="w-12 h-12 text-accent mb-4" />,
    },
    {
      id: 2,
      title: t('highlights.events.title'),
      description: t('highlights.events.description'),
      icon: <FaCalendarAlt className="w-12 h-12 text-accent mb-4" />,
    },
    {
      id: 3,
      title: t('highlights.projects.title'),
      description: t('highlights.projects.description'),
      icon: <FaRoad className="w-12 h-12 text-accent mb-4" />,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item) => (
            <div 
              key={item.id} 
              className="bg-gray-50 rounded-lg p-8 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl border-t-4 border-accent"
            >
              <div className="flex flex-col items-center text-center">
                {item.icon}
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 