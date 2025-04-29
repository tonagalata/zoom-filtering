/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure Next.js works properly with Netlify
  output: 'standalone',
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig; 