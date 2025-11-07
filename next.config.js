/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes
  // API routes needed for: /api/health, /api/dashboard-data
  images: {
    unoptimized: true,
  },
  // Only use basePath in production static export if needed
  // For development and production with API routes, keep these disabled
};

module.exports = nextConfig;