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
  async redirects() {
    // The feature section moved from /{locale}/functionalitati/... (shared RO slug)
    // to /{locale}/features/... (neutral segment + localized slug). Redirect the old
    // URLs to the features index so nothing 404s.
    return [
      { source: "/:locale/functionalitati/:path*", destination: "/:locale/features", permanent: true },
      { source: "/:locale/functionalitati", destination: "/:locale/features", permanent: true },
    ];
  },
};

export default nextConfig;
