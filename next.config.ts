import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Blog featured/inline images are served from the public Supabase Storage bucket.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bhpiugfpkqwxcqbolisb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
