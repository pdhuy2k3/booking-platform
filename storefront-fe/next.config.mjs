/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || "storefront-bff",
    KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET || "wYUpnvBO9kXw9Aa7M1fU9DakJQ5XNIvx",
    KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER || "http://localhost:9090/realms/BookingSmart",
    NEXT_PUBLIC_GATEWAY_BASE_URL: process.env.NEXT_PUBLIC_GATEWAY_BASE_URL || "http://localhost:8086",
  }
}

export default nextConfig
