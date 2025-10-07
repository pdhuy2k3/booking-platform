/**
 * Test file for Mapbox client-side functionality
 * Run this with: npm run test or in the browser console
 */

import { mapboxService } from './services/mapboxClientService';
import { MapboxSearchService } from './services/mapboxSearchService';

// Test the client service
export async function testMapboxClientService() {
  console.log('🧪 Testing Mapbox Client Service...');
  
  try {
    // Test search
    console.log('📍 Testing search...');
    const searchResults = await mapboxService.searchDestinations('Ho Chi Minh', 5);
    console.log('✅ Search results:', searchResults);
    
    // Test popular destinations
    console.log('🔥 Testing popular destinations...');
    const popularResults = await mapboxService.getPopularDestinations();
    console.log('✅ Popular destinations:', popularResults);
    
    return { success: true, searchResults, popularResults };
  } catch (error) {
    console.error('❌ Client service test failed:', error);
    return { success: false, error };
  }
}

// Test the search service directly
export async function testMapboxSearchService() {
  console.log('🧪 Testing Mapbox Search Service...');
  
  try {
    const searchService = new MapboxSearchService();
    
    // Test search
    console.log('📍 Testing direct search...');
    const searchResults = await searchService.searchDestinations('Da Nang', 5);
    console.log('✅ Direct search results:', searchResults);
    
    return { success: true, searchResults };
  } catch (error) {
    console.error('❌ Search service test failed:', error);
    return { success: false, error };
  }
}

// Test environment variables
export function testEnvironmentVariables() {
  console.log('🧪 Testing Environment Variables...');
  
  try {
    // Note: This import needs to be dynamic in a test environment
    // In production, the env is properly typed
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    if (!token) {
      console.warn('⚠️ NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN not found');
      return { success: false, error: 'Token not found' };
    }
    
    if (!token.startsWith('pk.')) {
      console.warn('⚠️ Token should start with "pk." for client-side usage');
      return { success: false, error: 'Invalid token format' };
    }
    
    console.log('✅ Environment variables configured correctly');
    return { success: true, token: token.substring(0, 10) + '...' };
  } catch (error) {
    console.error('❌ Environment test failed:', error);
    return { success: false, error };
  }
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 Running all Mapbox tests...');
  
  const envTest = testEnvironmentVariables();
  const clientTest = await testMapboxClientService();
  const searchTest = await testMapboxSearchService();
  
  console.log('📊 Test Results:');
  console.log('Environment:', envTest.success ? '✅' : '❌');
  console.log('Client Service:', clientTest.success ? '✅' : '❌');
  console.log('Search Service:', searchTest.success ? '✅' : '❌');
  
  return {
    environment: envTest,
    clientService: clientTest,
    searchService: searchTest,
    allPassed: envTest.success && clientTest.success && searchTest.success
  };
}

// Browser console helper
if (typeof window !== 'undefined') {
  (window as any).testMapbox = {
    runAllTests,
    testClient: testMapboxClientService,
    testSearch: testMapboxSearchService,
    testEnv: testEnvironmentVariables
  };
  
  console.log('🧪 Mapbox tests available in console:');
  console.log('- window.testMapbox.runAllTests()');
  console.log('- window.testMapbox.testClient()');
  console.log('- window.testMapbox.testSearch()');
  console.log('- window.testMapbox.testEnv()');
}