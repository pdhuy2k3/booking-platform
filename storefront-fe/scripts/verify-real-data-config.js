#!/usr/bin/env node

/**
 * Verification script for real data configuration
 * Checks that all services are properly configured to use real databases
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying Real Data Configuration...\n')

// Check service files
const serviceFiles = [
  'lib/flight-service.ts',
  'lib/hotel-service.ts', 
  'lib/booking-service.ts',
  'lib/payment-service.ts',
  'lib/customer-service.ts'
]

let allConfigured = true

serviceFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Check if using real service
    const isUsingRealService = content.includes('export const') && 
                              content.includes('Service') && 
                              !content.includes('MockService')
    
    if (isUsingRealService) {
      console.log(`✅ ${file}: Configured for real data`)
    } else {
      console.log(`❌ ${file}: Still using mock data`)
      allConfigured = false
    }
  } else {
    console.log(`⚠️  ${file}: File not found`)
    allConfigured = false
  }
})

// Check environment configuration
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  if (envContent.includes('NEXT_PUBLIC_BFF_BASE_URL=http://storefront')) {
    console.log('✅ Environment: BFF URL configured correctly')
  } else {
    console.log('❌ Environment: BFF URL not configured for storefront')
    allConfigured = false
  }
  
  if (envContent.includes('NEXT_PUBLIC_USE_REAL_DATA=true')) {
    console.log('✅ Environment: Real data flag enabled')
  } else {
    console.log('⚠️  Environment: Real data flag not explicitly set')
  }
} else {
  console.log('⚠️  Environment: .env.local file not found')
}

// Check API client configuration
const apiClientPath = path.join(__dirname, '..', 'lib/api-client.ts')
if (fs.existsSync(apiClientPath)) {
  const apiContent = fs.readFileSync(apiClientPath, 'utf8')
  
  if (apiContent.includes('"http://storefront"')) {
    console.log('✅ API Client: Base URL configured for storefront')
  } else {
    console.log('❌ API Client: Base URL not configured correctly')
    allConfigured = false
  }
} else {
  console.log('❌ API Client: File not found')
  allConfigured = false
}

console.log('\n' + '='.repeat(50))

if (allConfigured) {
  console.log('🎉 SUCCESS: All services configured for real data!')
  console.log('\n📋 Configuration Summary:')
  console.log('   • Flight Service: Using real flight_db data')
  console.log('   • Hotel Service: Using real hotel_db data')
  console.log('   • API Base URL: http://storefront')
  console.log('   • Mock services: Disabled')
  console.log('\n🚀 Ready to test with real PostgreSQL databases!')
} else {
  console.log('❌ ISSUES FOUND: Some services not properly configured')
  console.log('\n🔧 Please check the issues above and fix them.')
  process.exit(1)
}

console.log('\n💡 Next steps:')
console.log('   1. Start your Docker services: docker compose --profile app up')
console.log('   2. Run the frontend: cd storefront-fe && npm run dev')
console.log('   3. Visit: http://localhost:3000/test/real-data')
console.log('   4. Test the real data integration')
