export default defineEventHandler(async (event) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'backoffice-fe',
    port: 4201
  }
})
