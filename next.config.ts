import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Ensure these packages are bundled in serverless functions (not externalized)
  // This fixes "Cannot find module 'axe-core'" error on Vercel
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],

  // Force webpack to bundle axe-core instead of treating it as external
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't externalize these packages in serverless functions
      config.externals = config.externals || [];

      // Ensure axe-core is bundled, not treated as external
      if (Array.isArray(config.externals)) {
        config.externals = config.externals.filter((external: any) => {
          if (typeof external === 'string') {
            return !external.includes('axe-core');
          }
          return true;
        });
      }
    }
    return config;
  },
};

export default nextConfig;
