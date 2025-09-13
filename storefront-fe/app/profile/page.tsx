"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  CreditCard,
  Calendar,
  MapPin,
  Plane,
  Building2,
  Edit3,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import MainLayout from "../main-layout"

interface UserInfo {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  city: string
  country: string
}

interface PaymentMethod {
  id: string
  type: "visa" | "mastercard" | "amex"
  last4: string
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
}

interface Booking {
  id: string
  type: "flight" | "hotel" | "package"
  title: string
  destination: string
  date: string
  status: "confirmed" | "pending" | "cancelled"
  amount: number
  bookingReference: string
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    address: "123 Main Street, Apt 4B",
    city: "New York",
    country: "United States",
  })

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "2027",
      isDefault: true,
    },
    {
      id: "2",
      type: "mastercard",
      last4: "8888",
      expiryMonth: "08",
      expiryYear: "2026",
      isDefault: false,
    },
  ])

  const [bookings] = useState<Booking[]>([
    {
      id: "1",
      type: "flight",
      title: "New York to Paris",
      destination: "Paris, France",
      date: "2024-03-15",
      status: "confirmed",
      amount: 1250,
      bookingReference: "TRV-FL-001",
    },
    {
      id: "2",
      type: "hotel",
      title: "Grand Hotel Paris",
      destination: "Paris, France",
      date: "2024-03-15",
      status: "confirmed",
      amount: 450,
      bookingReference: "TRV-HT-002",
    },
    {
      id: "3",
      type: "package",
      title: "Tokyo Adventure Package",
      destination: "Tokyo, Japan",
      date: "2024-05-20",
      status: "pending",
      amount: 2800,
      bookingReference: "TRV-PK-003",
    },
    {
      id: "4",
      type: "flight",
      title: "London to Barcelona",
      destination: "Barcelona, Spain",
      date: "2024-02-10",
      status: "cancelled",
      amount: 320,
      bookingReference: "TRV-FL-004",
    },
  ])

  const handleSaveProfile = () => {
    setIsEditing(false)
    // Here you would typically save to backend
  }

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id))
  }

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return "💳"
      case "mastercard":
        return "💳"
      case "amex":
        return "💳"
      default:
        return "💳"
    }
  }

  const getBookingIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="h-5 w-5 text-cyan-400" />
      case "hotel":
        return <Building2 className="h-5 w-5 text-amber-400" />
      case "package":
        return <MapPin className="h-5 w-5 text-purple-400" />
      default:
        return <Calendar className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Profile Settings</h1>
              <p className="text-gray-400 mt-2">Manage your account information and preferences</p>
            </div>
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-xl">
                {userInfo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-800">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Booking History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Personal Information</CardTitle>
                    <CardDescription>Update your personal details and contact information</CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                    className={isEditing ? "bg-cyan-500 hover:bg-cyan-600" : "border-gray-700 hover:bg-gray-800"}
                  >
                    {isEditing ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo((prev) => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={userInfo.dateOfBirth}
                        onChange={(e) => setUserInfo((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={userInfo.address}
                        onChange={(e) => setUserInfo((prev) => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={userInfo.city}
                        onChange={(e) => setUserInfo((prev) => ({ ...prev, city: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={userInfo.country}
                        onChange={(e) => setUserInfo((prev) => ({ ...prev, country: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Methods Tab */}
            <TabsContent value="payments" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Payment Methods</CardTitle>
                    <CardDescription>Manage your saved payment methods for faster checkout</CardDescription>
                  </div>
                  <Button className="bg-cyan-500 hover:bg-cyan-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getCardIcon(method.type)}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium capitalize">{method.type}</span>
                            <span className="text-gray-400">•••• {method.last4}</span>
                            {method.isDefault && (
                              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!method.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultPayment(method.id)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Booking History Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Booking History</CardTitle>
                  <CardDescription>View and manage your travel bookings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="mt-1">{getBookingIcon(booking.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-white">{booking.title}</h3>
                              <Badge className={`${getStatusColor(booking.status)} capitalize`}>
                                {getStatusIcon(booking.status)}
                                <span className="ml-1">{booking.status}</span>
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-400">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-3 w-3" />
                                <span>{booking.destination}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(booking.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-gray-700 px-2 py-1 rounded">{booking.bookingReference}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">${booking.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-400 capitalize">{booking.type}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}
