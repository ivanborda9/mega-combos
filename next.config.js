/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Para poder subir fotos desde el admin (Vercel acepta hasta 4,5 MB por pedido)
    serverActions: { bodySizeLimit: "4mb" },
  },
};

module.exports = nextConfig;
