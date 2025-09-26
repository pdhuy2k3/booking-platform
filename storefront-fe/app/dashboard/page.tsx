"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, CreditCard, Calendar, MapPin, Settings } from "lucide-react"
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
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
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
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-md"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-md"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Address
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-md"
              >
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-md"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-md"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Booking History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <ProfileInfo user={user} onUpdate={refreshUser} />
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-6">
              <AddressForm user={user} onUpdate={refreshUser} />
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <AttributeManager user={user} onUpdate={refreshUser} />
            </TabsContent>

            {/* Payment Methods Tab */}
            <TabsContent value="payments" className="space-y-6">
              <PaymentMethodsTab />
            </TabsContent>

            {/* Booking History Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <BookingHistoryTab />
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
