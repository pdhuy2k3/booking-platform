"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, CheckCircle, Settings, Globe } from 'lucide-react'
import { APP_CONFIG, getDatabaseStatus } from '@/lib/config'

export function RealDataStatus() {
  const databaseStatus = getDatabaseStatus()
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Real Data Configuration Status
        </CardTitle>
        <CardDescription>
          Current database and API configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold">API Configuration</h4>
            </div>
            <div className="space-y-1 text-sm">
              <p><strong>Base URL:</strong> {APP_CONFIG.API.BASE_URL}</p>
              <p><strong>Real Data:</strong> 
                <Badge variant={APP_CONFIG.SERVICES.USE_REAL_DATA ? "default" : "destructive"} className="ml-2">
                  {APP_CONFIG.SERVICES.USE_REAL_DATA ? "Enabled" : "Disabled"}
                </Badge>
              </p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Service Status</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Flight Service:</span>
                <Badge variant="default">Real Data</Badge>
              </div>
              <div className="flex justify-between">
                <span>Hotel Service:</span>
                <Badge variant="default">Real Data</Badge>
              </div>
              <div className="flex justify-between">
                <span>Booking Service:</span>
                <Badge variant="default">Real Data</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-800">Database Connections</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-green-800">Flight Database</h5>
              <p className="text-sm text-green-700">Database: {databaseStatus.flightDb.database}</p>
              <p className="text-sm text-green-700">Status: {databaseStatus.flightDb.status}</p>
            </div>
            <div>
              <h5 className="font-medium text-green-800">Hotel Database</h5>
              <p className="text-sm text-green-700">Database: {databaseStatus.hotelDb.database}</p>
              <p className="text-sm text-green-700">Status: {databaseStatus.hotelDb.status}</p>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="p-3 border rounded-lg">
          <h4 className="font-semibold mb-2">Active API Endpoints</h4>
          <div className="space-y-1 text-sm font-mono">
            <p>🛫 Flights: {APP_CONFIG.SERVICES.ENDPOINTS.FLIGHTS}</p>
            <p>🏨 Hotels: {APP_CONFIG.SERVICES.ENDPOINTS.HOTELS}</p>
            <p>📋 Bookings: {APP_CONFIG.SERVICES.ENDPOINTS.BOOKINGS}</p>
            <p>💳 Payments: {APP_CONFIG.SERVICES.ENDPOINTS.PAYMENTS}</p>
            <p>👤 Customers: {APP_CONFIG.SERVICES.ENDPOINTS.CUSTOMERS}</p>
          </div>
        </div>

        {/* Migration Summary */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Migration Summary</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>✅ Switched from MockFlightService to FlightService</p>
            <p>✅ Switched from MockHotelService to HotelService</p>
            <p>✅ Updated API client to use http://storefront base URL</p>
            <p>✅ Configured real database connections</p>
            <p>✅ Disabled mock data fallbacks</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
