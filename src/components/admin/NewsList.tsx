"use client";

import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiEdit, FiEye, FiTrash } from 'react-icons/fi';

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
};

interface NewsListProps {
  newsItems: NewsItem[];
  onEdit: (news: NewsItem) => void;
  onDelete: (id: string) => void;
}

export default function NewsList({ newsItems, onEdit, onDelete }: NewsListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  
  const handleDeleteClick = (id: string) => {
    setConfirmId(id);
  };
  
  const confirmDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/news?id=${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete news item');
      }
      
      onDelete(id);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setConfirmId(null);
    }
  };
  
  const cancelDelete = () => {
    setConfirmId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {newsItems.map((news) => (
              <tr key={news.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {news.image ? (
                    <div className="w-16 h-16 relative overflow-hidden rounded">
                      <Image 
                        src={news.image} 
                        alt={news.title}
                        layout="fill"
                        objectFit="cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">
                    {news.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {format(new Date(news.date), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {confirmId === news.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => confirmDelete(news.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Link 
                        href={`/news/${news.slug}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded"
                        target="_blank"
                        title="View"
                      >
                        <FiEye />
                      </Link>
                      <button
                        onClick={() => onEdit(news)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(news.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                        title="Delete"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {newsItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">No news items found. Create your first one!</p>
        </div>
      )}
    </div>
  );
} 