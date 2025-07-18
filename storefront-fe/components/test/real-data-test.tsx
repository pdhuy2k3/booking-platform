"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// Import real services
import { flightService, hotelService, apiClient } from '@/lib/api'
import { useApi } from '@/hooks/use-api'
import { APP_CONFIG, getDatabaseStatus, initializeConfig } from '@/lib/config'
import { RealDataStatus } from '@/components/status/real-data-status'

interface TestResult {
  service: string
  endpoint: string
  status: 'success' | 'error' | 'pending'
  message: string
  data?: any
  responseTime?: number
}

export function RealDataTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  // Initialize configuration
  React.useEffect(() => {
    initializeConfig()
  }, [])

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setTestResults([])
  }

  // Test API connectivity
  const testApiConnectivity = async () => {
    const startTime = Date.now()
    try {
      await apiClient.healthCheck()
      const responseTime = Date.now() - startTime
      addTestResult({
        service: 'API Gateway',
        endpoint: '/actuator/health',
        status: 'success',
        message: 'BFF connection successful',
        responseTime
      })
    } catch (error: any) {
      addTestResult({
        service: 'API Gateway',
        endpoint: '/actuator/health',
        status: 'error',
        message: error.message || 'Connection failed'
      })
    }
  }

  // Test flight service with real data
  const testFlightService = async () => {
    const startTime = Date.now()
    try {
      const searchParams = {
        origin: 'HAN',
        destination: 'SGN',
        departureDate: '2024-02-15',
        passengers: 1,
        seatClass: 'ECONOMY'
      }
      
      const result = await flightService.searchFlights(searchParams)
      const responseTime = Date.now() - startTime
      
      addTestResult({
        service: 'Flight Service',
        endpoint: '/api/flights/storefront/search',
        status: 'success',
        message: `Found ${result.flights?.length || 0} flights from flight_db`,
        data: result,
        responseTime
      })
    } catch (error: any) {
      addTestResult({
        service: 'Flight Service',
        endpoint: '/api/flights/storefront/search',
        status: 'error',
        message: error.message || 'Flight search failed'
      })
    }
  }

  // Test hotel service with real data
  const testHotelService = async () => {
    const startTime = Date.now()
    try {
      const searchParams = {
        destination: 'Ho Chi Minh City',
        checkInDate: '2024-02-15',
        checkOutDate: '2024-02-17',
        guests: 2,
        rooms: 1
      }
      
      const result = await hotelService.searchHotels(searchParams)
      const responseTime = Date.now() - startTime
      
      addTestResult({
        service: 'Hotel Service',
        endpoint: '/api/hotels/storefront/search',
        status: 'success',
        message: `Found ${result.hotels?.length || 0} hotels from hotel_db`,
        data: result,
        responseTime
      })
    } catch (error: any) {
      addTestResult({
        service: 'Hotel Service',
        endpoint: '/api/hotels/storefront/search',
        status: 'error',
        message: error.message || 'Hotel search failed'
      })
    }
  }

  // Test popular destinations
  const testPopularDestinations = async () => {
    const startTime = Date.now()
    try {
      const result = await flightService.getPopularDestinations()
      const responseTime = Date.now() - startTime
      
      addTestResult({
        service: 'Flight Service',
        endpoint: '/api/flights/storefront/popular-destinations',
        status: 'success',
        message: `Loaded ${result?.length || 0} popular destinations`,
        data: result,
        responseTime
      })
    } catch (error: any) {
      addTestResult({
        service: 'Flight Service',
        endpoint: '/api/flights/storefront/popular-destinations',
        status: 'error',
        message: error.message || 'Failed to load destinations'
      })
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true)
    clearResults()
    
    console.log('🧪 Starting Real Data Integration Tests...')
    
    await testApiConnectivity()
    await testFlightService()
    await testHotelService()
    await testPopularDestinations()
    
    setIsRunningTests(false)
    console.log('✅ Real Data Integration Tests Completed')
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'pending':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const databaseStatus = getDatabaseStatus()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Real Data Integration Test</h1>
        <p className="text-gray-600">
          Testing connection to PostgreSQL databases via BFF at <code className="bg-gray-100 px-2 py-1 rounded">http://storefront</code>
        </p>
      </div>

      {/* Configuration Status */}
      <RealDataStatus />

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Tests</CardTitle>
          <CardDescription>
            Test real API endpoints and database connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={runAllTests} disabled={isRunningTests}>
              {isRunningTests && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run All Tests
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Real-time results from database integration tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="font-semibold">{result.service}</h4>
                        <p className="text-sm text-gray-600 font-mono">{result.endpoint}</p>
                        <p className="text-sm mt-1">{result.message}</p>
                        {result.responseTime && (
                          <p className="text-xs text-gray-500 mt-1">
                            Response time: {result.responseTime}ms
                          </p>
                        )}
                      </div>
                    </div>
                    {result.data && (
                      <Badge variant="secondary">
                        {Array.isArray(result.data.flights) ? `${result.data.flights.length} flights` :
                         Array.isArray(result.data.hotels) ? `${result.data.hotels.length} hotels` :
                         Array.isArray(result.data) ? `${result.data.length} items` : 'Data loaded'}
                      </Badge>
                    )}
                  </div>
                  
                  {result.data && result.status === 'success' && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        View raw data
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
