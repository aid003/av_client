import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.img.avito.st',
      },
      {
        protocol: 'https',
        hostname: 'www.avito.st',
      },
      {
        protocol: 'https',
        hostname: '*.avito.st',
      },
    ],
    unoptimized: true, // Отключаем оптимизацию для загрузки изображений с приватных IP
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
