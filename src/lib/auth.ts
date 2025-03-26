import { authOptions } from '@/app/api/auth/auth-options';
import { getServerSession } from 'next-auth';

/**
 * Helper function to safely get the base URL for API calls
 * This ensures we don't get URL construction errors
 */
export function getBaseUrl() {
  // Check for NEXTAUTH_URL first
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Default for various environments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Local development fallback
  return 'http://localhost:3000';
}

/**
 * Helper to get the server session consistently
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Build a safe API URL with the provided path
 */
export function getApiUrl(path: string) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Safely construct a full URL for a given path
 */
export function buildSafeUrl(path: string) {
  try {
    const baseUrl = getBaseUrl();
    // Make sure path starts with a slash if it's a relative path
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return new URL(normalizedPath, baseUrl).toString();
  } catch (error) {
    console.error('Error building URL:', error);
    // Fallback to simple string concatenation
    const baseUrl = getBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }
} 