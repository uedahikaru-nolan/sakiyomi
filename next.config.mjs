/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdninstagram.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // 動画アップロード用に100MBに設定
    },
  },
}

export default nextConfig
