import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthStatus } from "@/components/auth-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Database, CheckCircle } from "lucide-react"

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Authentication Testing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Test the complete authentication flow including Keycloak integration, 
              user profile fetching, and state management
            </p>
          </div>

          {/* Authentication Flow Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Authentication Flow
              </CardTitle>
              <CardDescription>
                How the authentication system works in the storefront
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Check Authentication Status</h4>
                    <p className="text-sm text-gray-600">
                      Call <code className="bg-gray-100 px-1 rounded">/authentication/user</code> endpoint
                      in storefront-bff to check if user is authenticated
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Fetch User Profile</h4>
                    <p className="text-sm text-gray-600">
                      If authenticated, fetch detailed user profile from customer-service
                      using JWT token (backend extracts userId automatically)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Update UI State</h4>
                    <p className="text-sm text-gray-600">
                      Update header dropdown menu and other UI components based on authentication status
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">GET</Badge>
                    <code className="text-sm">/authentication/user</code>
                  </div>
                  <p className="text-xs text-gray-600 ml-12">Check authentication status</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">GET</Badge>
                    <code className="text-sm">/api/customers/storefront/profile</code>
                  </div>
                  <p className="text-xs text-gray-600 ml-12">Fetch user profile (JWT-based)</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">POST</Badge>
                    <code className="text-sm">/logout</code>
                  </div>
                  <p className="text-xs text-gray-600 ml-12">Logout user</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  Features Tested
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Keycloak OAuth2 integration</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Session management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>User profile fetching</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Dynamic header menu</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Authentication state management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Logout functionality</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Authentication Status */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Live Authentication Status
            </h2>
            <AuthStatus />
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Check the current authentication status above</li>
                <li>If not logged in, click "Đăng nhập" to test the login flow</li>
                <li>Observe how the header menu changes after authentication</li>
                <li>Check if user profile information is loaded correctly</li>
                <li>Test the logout functionality</li>
                <li>Verify that the UI updates properly after logout</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
