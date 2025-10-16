/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/LinktoFunnel' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/LinktoFunnel' : '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;