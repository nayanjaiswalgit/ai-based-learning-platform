/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'image.mux.com'],
  },
  transpilePackages: ['@mux/mux-player-react'],
};

module.exports = nextConfig;
