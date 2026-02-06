import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use server-side rendering with Neon PostgreSQL
  // Remove "export" to enable dynamic routes
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
