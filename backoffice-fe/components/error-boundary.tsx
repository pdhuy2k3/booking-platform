"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} reset={this.handleReset} />
      }

      return <DefaultErrorFallback error={this.state.error!} reset={this.handleReset} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-red-900">
            Đã xảy ra lỗi
          </CardTitle>
          <CardDescription className="text-red-700">
            Component gặp sự cố và không thể hiển thị
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left">
              <p className="text-gray-800 text-sm font-medium mb-2">
                Chi tiết lỗi:
              </p>
              <pre className="text-xs text-gray-600 overflow-auto max-h-24">
                {error.message}
              </pre>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin">
                <Home className="w-4 h-4 mr-2" />
                Về Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorBoundary
