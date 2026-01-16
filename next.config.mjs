import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              connect-src 'self' https://nursingpracticals.pythonanywhere.com;
              img-src 'self' data: blob:;
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              font-src 'self' data:;
            `.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
//   async rewrites() {
//   return [
//     {
//       source: "/api/:path*",
//       destination: "http://localhost:8000/api/:path*",
//     },
//   ];
// },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  compiler: {
    // Remove unnecessary polyfills for modern browsers
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Target modern browsers only
  experimental: {
    browsersListForSwc: true,
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  turbopack: {},
  /* config options here */
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Optional: customize service worker
  // sw: 'service-worker.js',
  // runtimeCaching: [], // Add custom caching strategies if needed
});

export default pwaConfig(nextConfig);
