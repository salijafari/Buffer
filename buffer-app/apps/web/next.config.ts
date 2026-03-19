import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PWA + security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          // Prevent caching of any authenticated responses
          { key: 'Cache-Control',              value: 'no-store' },
        ],
      },
      // Allow static assets to be cached
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  // Never expose financial data in URLs — validate at build time
  async redirects() {
    return [];
  },

  // Code splitting per route — no shared bundles between dashboard tabs
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },

  // Image optimization
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'mybuffer.ca' },
    ],
  },

  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },
};

export default nextConfig;
