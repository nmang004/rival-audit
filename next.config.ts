import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Keep these packages external (don't bundle) because they have native dependencies
  // DO NOT add axe-core or @axe-core/puppeteer here - they need to be bundled
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],

  // Explicitly tell Next.js to bundle these packages (override default externalization)
  bundlePagesRouterDependencies: true,

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add alias to ensure axe-core can be resolved
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        'axe-core': require.resolve('axe-core'),
        '@axe-core/puppeteer': require.resolve('@axe-core/puppeteer'),
      };
    }
    return config;
  },
};

export default nextConfig;
