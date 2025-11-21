/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/shared-types'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  // Admin-specific configurations
  images: {
    // Updated from deprecated 'domains' to 'remotePatterns' for Next.js 16
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
  // Enable React Compiler for better performance (moved to root in Next.js 16)
  reactCompiler: false, // Disabled temporarily due to babel-plugin-react-compiler dependency
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
}

module.exports = nextConfig
