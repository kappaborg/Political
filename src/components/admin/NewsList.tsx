"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
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
  // Format the date to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
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
                  <div className="relative h-12 w-20 rounded overflow-hidden">
                    <Image 
                      src={news.image} 
                      alt={news.title} 
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }} 
                      className="rounded"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{news.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-md">{news.summary}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(news.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <Link 
                      href={`/news/${news.slug}`}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors" 
                      target="_blank"
                    >
                      <FiEye className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => onEdit(news)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(news.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {newsItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No news articles found. Add your first one!</p>
        </div>  
      )}
    </div>
  );
} 