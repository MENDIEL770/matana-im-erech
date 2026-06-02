import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "svxtgddusaylwtmjsccc.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000", "localhost:3001"] },
  },
};

export default nextConfig;
