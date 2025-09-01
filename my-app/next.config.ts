import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false
  },
  webpack: (config) => {
    return config;
  }
};

export default nextConfig;
