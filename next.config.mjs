/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint roda em CI dedicado; não bloqueia o build de deploy.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
