export default defineEventHandler(async (event) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'storefront-fe',
    port: 4200
  }
})
