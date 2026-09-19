import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Image Optimization configuration for CMS Platform
  images: {
    remotePatterns: [
      // S3 & Cloud Storage
      {
        protocol: 'https',
        hostname: 'owntheshop.s3.ap-southeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      // Cloudinary & CDNs
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '127.0.0.1',
      },
      // Permissive wildcard fallback for merchant-uploaded dynamic product images
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
