"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogIn, Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              </div>
              <CardTitle className="text-2xl text-white">Loading...</CardTitle>
              <CardDescription className="text-gray-400">
                Checking authentication status
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4">
                <LogIn className="h-8 w-8 text-cyan-400" />
              </div>
              <CardTitle className="text-2xl text-white">Authentication Required</CardTitle>
              <CardDescription className="text-gray-400">
                Please sign in to access this page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={login}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
