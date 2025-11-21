/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/shared-types'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
  },
  async rewrites() {
    return [
      // Analytics Service
      {
        source: '/api/analytics/:path*',
        destination: `${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003'}/analytics/:path*`,
      },
      // Bootcamp Service endpoints
      {
        source: '/api/bootcamps/:path*',
        destination: `${process.env.BOOTCAMP_SERVICE_URL || 'http://localhost:3006'}/bootcamps/:path*`,
      },
      {
        source: '/api/cohorts/:path*',
        destination: `${process.env.BOOTCAMP_SERVICE_URL || 'http://localhost:3006'}/cohorts/:path*`,
      },
      {
        source: '/api/live-sessions/:path*',
        destination: `${process.env.BOOTCAMP_SERVICE_URL || 'http://localhost:3006'}/live-sessions/:path*`,
      },
      {
        source: '/api/one-on-one-meetings/:path*',
        destination: `${process.env.BOOTCAMP_SERVICE_URL || 'http://localhost:3006'}/one-on-one-meetings/:path*`,
      },
      {
        source: '/api/assignments/:path*',
        destination: `${process.env.BOOTCAMP_SERVICE_URL || 'http://localhost:3006'}/assignments/:path*`,
      },
      {
        source: '/api/certificates/:path*',
        destination: `${process.env.BOOTCAMP_SERVICE_URL || 'http://localhost:3006'}/certificates/:path*`,
      },
      // Auth Service
      {
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_SERVICE_URL || 'http://localhost:3002'}/auth/:path*`,
      },
      // Course Service
      {
        source: '/api/courses/:path*',
        destination: `${process.env.COURSE_SERVICE_URL || 'http://localhost:3007'}/courses/:path*`,
      },
      // Assessment Service
      {
        source: '/api/assessments/:path*',
        destination: `${process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:3005'}/assessments/:path*`,
      },
    ];
  },
  // Next.js 16 optimizations
  images: {
    // Default cache TTL updated to 4 hours (Next.js 16 default)
    minimumCacheTTL: 14400,
  },
  // Enable React Compiler for better performance (moved to root in Next.js 16)
  reactCompiler: false, // Disabled temporarily due to babel-plugin-react-compiler dependency
  experimental: {},
}

module.exports = nextConfig
