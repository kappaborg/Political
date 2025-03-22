import LoginForm from '@/components/admin/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login | Municipality Portal',
  description: 'Login to the administration panel'
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-lg p-8">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-medium">
            Enter your credentials to access the admin panel
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
} 