import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Experimental ──────────────────────────────────────────────────────────
  experimental: {
    // Enables typed Route Handlers and Server Actions
    typedRoutes: true,
  },

  // ─── Images ────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Google user avatars (OAuth)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // ─── Headers ───────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // Cache static assets aggressively for Cloudflare CDN
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ─── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
      },
    ];
  },

  // ─── Logging ───────────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // ─── Output ────────────────────────────────────────────────────────────────
  // "standalone" is not needed for Vercel — Vercel handles it natively.
  // Keep default for Vercel deployment compatibility.

  // ─── TypeScript & ESLint ───────────────────────────────────────────────────
  typescript: {
    // Build fails on TypeScript errors — never ignore them.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Build fails on ESLint errors — never ignore them.
    ignoreDuringBuilds: false,
  },

  // ─── Bundle Analyzer ───────────────────────────────────────────────────────
  // To analyze: ANALYZE=true npm run build
  ...(process.env.ANALYZE === "true" && {
    // @ts-expect-error — optional peer dep, not in devDeps by default
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ...require("@next/bundle-analyzer")({ enabled: true }),
  }),
};

export default nextConfig;
