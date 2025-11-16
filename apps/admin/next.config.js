/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/shared-types'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  // Admin-specific configurations
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
}

module.exports = nextConfig
