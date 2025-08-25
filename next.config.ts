import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    // Enable if you want to use the new app directory features
    // appDir: true,
  },
  // Disable telemetry in production
  telemetry: false,
  // Disable ESLint during build for Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build for Docker
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
