import type { NextConfig } from "next";

const nextConfig = {
  reactCompiler: true,

  // 性能优化
  compress: true,
  poweredByHeader: false,

  // 图片优化
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  // 安全头部
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // TypeScript 和 ESLint 配置
  typescript: {
    ignoreBuildErrors: false,
  },
} satisfies NextConfig;

export default nextConfig;
