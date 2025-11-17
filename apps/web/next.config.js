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
        destination: `${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003'}/:path*`,
      },
      // Bootcamp Service
      {
        source: '/api/bootcamps/:path*',
        destination: `${process.env.BOOTCAMP_SERVICE_URL || 'http://localhost:3006'}/:path*`,
      },
      // Auth Service
      {
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_SERVICE_URL || 'http://localhost:3002'}/:path*`,
      },
      // Course Service
      {
        source: '/api/courses/:path*',
        destination: `${process.env.COURSE_SERVICE_URL || 'http://localhost:3007'}/:path*`,
      },
      // Assessment Service
      {
        source: '/api/assessments/:path*',
        destination: `${process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:3005'}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
