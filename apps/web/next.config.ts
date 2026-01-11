import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'content.stack-auth.com',
      }
    ],
  },
};

export default nextConfig;
