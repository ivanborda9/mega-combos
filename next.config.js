/** @type {import('next').NextConfig} */
const nextConfig = {
  // "Combos" pasó a llamarse "Artículos": los links viejos siguen funcionando
  async redirects() {
    return [
      { source: "/combo/:slug", destination: "/articulo/:slug", permanent: true },
      { source: "/admin/combos/:path*", destination: "/admin/articulos/:path*", permanent: true },
      { source: "/admin/combos", destination: "/admin/articulos", permanent: true },
    ];
  },
};

module.exports = nextConfig;
