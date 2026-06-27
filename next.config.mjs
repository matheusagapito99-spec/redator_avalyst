/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint roda em CI dedicado; não bloqueia o build de deploy.
    ignoreDuringBuilds: true,
  },
  // Extratores de texto rodam no servidor sem serem empacotados pelo bundler.
  serverExternalPackages: ["pdf-parse", "mammoth"],
  // Uploads via server action: o padrão do Next é 1MB. Sobe para ~4.5MB
  // (teto prático do plano Vercel para corpo de requisição).
  experimental: {
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

export default nextConfig;
