"use client";

import { format } from 'date-fns';
import Image from 'next/image';
import { useState } from 'react';
import { FiArrowDown, FiArrowUp, FiEdit, FiTrash2 } from 'react-icons/fi';

interface Activity {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  isOngoing: boolean;
}

interface ActivitiesListProps {
  activities: Activity[];
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onUpdateOrder: (reorderedIds: string[]) => void;
  isProcessing: boolean;
  locale?: string;
}

export default function ActivitiesList({
  activities,
  onEditActivity,
  onDeleteActivity,
  onUpdateOrder,
  isProcessing,
  locale = 'bs'
}: ActivitiesListProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // ID dizisi oluştur
  const getActivityIds = () => activities.map(activity => activity.id);

  // Aktiviteyi yukarı taşı
  const moveUp = (index: number) => {
    if (index <= 0 || isProcessing) return;
    
    const newIds = getActivityIds();
    [newIds[index], newIds[index - 1]] = [newIds[index - 1], newIds[index]];
    onUpdateOrder(newIds);
  };

  // Aktiviteyi aşağı taşı
  const moveDown = (index: number) => {
    if (index >= activities.length - 1 || isProcessing) return;
    
    const newIds = getActivityIds();
    [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    onUpdateOrder(newIds);
  };

  // Sürükle başlangıcı
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  // Sürükleme bittiğinde
  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  // Bir öğenin üzerine sürüklendiğinde
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingIndex === null || draggingIndex === index || isProcessing) {
      return;
    }
    
    const newIds = getActivityIds();
    const draggingId = newIds[draggingIndex];
    
    // Sürüklenen öğeyi listeden çıkar
    newIds.splice(draggingIndex, 1);
    
    // Hedef konuma ekle
    newIds.splice(index, 0, draggingId);
    
    // Yeni sıralamayı uygula
    onUpdateOrder(newIds);
    
    // Sürükleme indeksini güncelle
    setDraggingIndex(index);
  };

  // Tarih formatla
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {locale === 'en' ? 'Activities' : 'Aktiviteler'}
        </h2>
        <p className="text-gray-500">
          {locale === 'en' ? 'No activities found.' : 'Henüz aktivite bulunmuyor.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {locale === 'en' ? 'Activities' : 'Aktiviteler'}
      </h2>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`border rounded p-3 ${
              draggingIndex === index ? 'bg-blue-50 border-blue-300' : 'bg-white'
            } cursor-grab transition-all hover:shadow-md`}
            draggable={!isProcessing}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-16 h-16 relative overflow-hidden rounded">
                <Image
                  src={activity.image || '/images/activity-placeholder.jpg'}
                  alt={activity.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              
              <div className="flex-grow">
                <h3 className="font-medium text-gray-800">{activity.title}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(activity.date)}
                  {activity.location && ` • ${activity.location}`}
                </p>
                <p className="text-xs text-gray-600 truncate">{activity.excerpt}</p>
              </div>
              
              <div className="flex-shrink-0 flex flex-col gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => onEditActivity(activity)}
                  disabled={isProcessing}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                  title={locale === 'en' ? 'Edit' : 'Düzenle'}
                >
                  <FiEdit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteActivity(activity.id)}
                  disabled={isProcessing}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                  title={locale === 'en' ? 'Delete' : 'Sil'}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
              
              <div className="flex-shrink-0 flex flex-col gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0 || isProcessing}
                  className={`p-1.5 rounded-full ${
                    index === 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  title={locale === 'en' ? 'Move up' : 'Yukarı taşı'}
                >
                  <FiArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === activities.length - 1 || isProcessing}
                  className={`p-1.5 rounded-full ${
                    index === activities.length - 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  title={locale === 'en' ? 'Move down' : 'Aşağı taşı'}
                >
                  <FiArrowDown size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        {locale === 'en' 
          ? 'Use the up/down arrows to reorder activities or drag and drop items to rearrange them.' 
          : 'Aktivitelerin sırasını düzenlemek için yukarı/aşağı oklarını kullanabilir veya öğeleri sürükleyip bırakabilirsiniz.'}
      </p>
    </div>
  );
} 