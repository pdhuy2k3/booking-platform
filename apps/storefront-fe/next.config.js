//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Disable deprecated SVGR support
    svgr: false,
  },
  // Enable standalone output for Docker deployments
  output: 'standalone',
  // Configure port for production
  serverRuntimeConfig: {
    port: process.env.NEXT_PORT || 3000
  },
  
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
