"use client";

import { useTranslation } from '@/components/TranslationProvider';
import Link from 'next/link';
import { FaBuilding, FaCalendarAlt, FaRoad } from 'react-icons/fa';

export default function MunicipalServices() {
  const { t } = useTranslation();
  
  const services = [
    {
      id: 1,
      title: t('highlights.services.title', 'Municipal Services'),
      description: t('highlights.services.description', 'Access a wide range of municipal services including permits, registrations, and more'),
      icon: <FaBuilding size={48} className="text-blue-600" />,
      url: '/services'
    },
    {
      id: 2,
      title: t('highlights.events.title', 'Event Calendar'),
      description: t('highlights.events.description', 'Stay updated with local events, council meetings, and community gatherings'),
      icon: <FaCalendarAlt size={48} className="text-blue-600" />,
      url: '/events'
    },
    {
      id: 3,
      title: t('highlights.projects.title', 'Development Projects'),
      description: t('highlights.projects.description', 'Learn about ongoing and upcoming infrastructure and community development projects'),
      icon: <FaRoad size={48} className="text-blue-600" />,
      url: '/projects'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="bg-white rounded-lg p-8 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <Link href={service.url} className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 