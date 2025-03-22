/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // i18n configuration is not supported in App Router, we're using our custom solution instead
  
  webpack: (config) => {
    // Fix for conflicts with older packages
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any specific package aliases needed here
    }
    return config;
  },
}

module.exports = nextConfig 