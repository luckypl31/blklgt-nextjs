import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/iamwesmiller-270ac.firebasestorage.app/**',
      },
    ],
  },
};

export default nextConfig;
