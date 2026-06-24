/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint roda em CI dedicado; não bloqueia o build de deploy.
    ignoreDuringBuilds: true,
  },
  // Extratores de texto rodam no servidor sem serem empacotados pelo bundler.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
