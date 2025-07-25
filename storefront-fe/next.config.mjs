/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.unsplash.com', 'www.pexels.com'],
    unoptimized: true,
  },
  output: 'standalone',
}

export default nextConfig
