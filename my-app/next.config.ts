import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config) => {
    return config;
  }
};

export default nextConfig;
