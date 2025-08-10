// apps/backoffice-fe/nuxt.config.ts
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  // Workspace configuration for monorepo
  workspaceDir: '../../',
  srcDir: 'src',
  
  // Build configuration optimized for Nx
  buildDir: '.nuxt', // Relative to the project root
  
  // Module directories for path resolving (useful for monorepos)
  modulesDir: ['../../node_modules'],
  
  devtools: { enabled: true },
  devServer: {
    host: 'localhost',
    port: 4201, // Different port from storefront-fe
  },
  
  // TypeScript configuration
  typescript: {
    typeCheck: true,
    strict: false, // Can be enabled when ready
    tsConfig: {
      compilerOptions: {
        moduleResolution: 'bundler'
      }
    }
  },
  
  imports: {
    autoImport: true,
  },

  css: ['./app/assets/css/styles.css'],

  vite: {
    plugins: [nxViteTsPaths()],
  },
  
  // Nitro configuration for build output
  nitro: {
    output: {
      dir: '../../dist/apps/backoffice-fe',
    },
    preset: 'node-server',
    routeRules: {
      '/api/health': { 
        cors: true, 
        headers: { 'cache-control': 'no-cache' } 
      }
    },
    experimental: {
      wasm: false
    }
  },
  
  // Runtime configuration
  runtimeConfig: {
    // Private config that is only available on the server
    apiSecret: process.env.NUXT_API_SECRET || 'dev-secret',
    // Config within public will be also exposed to the client
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8089' // backoffice-bff port
    }
  },

  // Compatibility date for Nitro
  compatibilityDate: '2025-08-09'
});
