/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ai-learning/shared-types', '@ai-learning/ui-components'],
  webpack: (config) => {
    // Monaco editor webpack config
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
    });
    return config;
  },
};

module.exports = nextConfig;
