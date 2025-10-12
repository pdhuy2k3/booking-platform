"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, CreditCard, Calendar, MapPin, Settings, ShieldCheck } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { AttributeManager } from "@/components/attribute-manager"
import { 
  ProfileInfo, 
  AddressForm, 
  PasswordChangeModal, 
  PaymentMethodsTab, 
  BookingHistoryTab 
} from "@/modules/profile"

export default function DashboardPage() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const { user, refreshUser } = useAuth()

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) // Remove the # symbol
      if (hash && ["profile", "address", "preferences", "payments", "bookings"].includes(hash)) {
        setActiveTab(hash)
      }
    }

    // Set initial tab from hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    window.location.hash = value
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="h-screen bg-gray-50 text-gray-900 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Loading...</h1>
              <p className="text-gray-600">Please wait while we load your dashboard.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="h-screen w-full bg-gray-50 text-gray-900 px-3 py-4 sm:px-4 md:px-6 flex flex-col">
        <div className="w-full space-y-6 md:space-y-8 flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 flex flex-col flex-1 min-h-0">
            <TabsList className="flex w-full flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm md:grid md:grid-cols-5 md:gap-1">
              <TabsTrigger
                value="profile"
                className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-md transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm md:flex-none md:min-w-0"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-md transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm md:flex-none md:min-w-0"
              >
                <MapPin className="h-4 w-4" />
                Address
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-md transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm md:flex-none md:min-w-0"
              >
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-md transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm md:flex-none md:min-w-0"
              >
                <CreditCard className="h-4 w-4" />
                Payment Methods
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-md transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm md:flex-none md:min-w-0"
              >
                <Calendar className="h-4 w-4" />
                Booking History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 overflow-y-auto">
              <div className="w-full space-y-4">
                <ProfileInfo user={user} onUpdate={refreshUser} />
                <Card className="border-gray-200">
                  <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-1 h-5 w-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-gray-900">Account Security</CardTitle>
                        <CardDescription>
                          Keep your account secure by updating your password regularly.
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                      Change Password
                    </Button>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-6 overflow-y-auto">
              <div className="w-full">
                <AddressForm user={user} onUpdate={refreshUser} />
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6 overflow-y-auto">
              <div className="w-full">
                <AttributeManager user={user} onUpdate={refreshUser} />
              </div>
            </TabsContent>

            {/* Payment Methods Tab */}
            <TabsContent value="payments" className="space-y-6 overflow-y-auto">
              <div className="w-full">
                <PaymentMethodsTab />
              </div>
            </TabsContent>

            {/* Booking History Tab */}
            <TabsContent value="bookings" className="space-y-6 flex-1 min-h-0">
              <div className="w-full h-full">
                <BookingHistoryTab />
              </div>
            </TabsContent>
          </Tabs>

          {/* Password Change Modal */}
          <PasswordChangeModal
            isOpen={isChangingPassword}
            onClose={() => setIsChangingPassword(false)}
            onSuccess={refreshUser}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
