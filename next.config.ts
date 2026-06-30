import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow large CSV uploads (up to 50 MB)
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
