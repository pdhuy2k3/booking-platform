"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Settings,
  Bell,
  CreditCard,
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  CarTaxiFrontIcon as Taxi,
} from "lucide-react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("bookings")

  const user = {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
  }

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "flight":
        return Plane
      case "train":
        return Train
      case "bus":
        return Bus
      case "taxi":
        return Taxi
      case "ferry":
        return Ship
      case "car":
        return Car
      default:
        return Plane
    }
  }

  const bookings = [
    {
      id: "1",
      type: "flight",
      provider: "Air India",
      from: "Delhi",
      to: "Mumbai",
      date: "2024-03-20",
      time: "06:00",
      status: "confirmed",
      bookingRef: "AI123456",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=200&fit=crop",
    },
    {
      id: "2",
      type: "train",
      provider: "Rajdhani Express",
      from: "Mumbai",
      to: "Bangalore",
      date: "2024-03-15",
      time: "16:55",
      status: "completed",
      bookingRef: "RJ789012",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop",
    },
    {
      id: "3",
      type: "bus",
      provider: "RedBus Volvo",
      from: "Delhi",
      to: "Goa",
      date: "2024-03-10",
      time: "20:00",
      status: "cancelled",
      bookingRef: "RB345678",
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=200&fit=crop",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">Manage your bookings and account settings</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <Bell className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="card text-center">
              <Image
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                width={100}
                height={100}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{user.name}</h3>
              <p className="text-gray-600 mb-4">{user.email}</p>

              <div className="space-y-3">
                <Link
                  href="/wallet"
                  className="flex items-center justify-center w-full py-2 px-4 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-colors"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Wallet
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-center w-full py-2 px-4 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </motion.button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card mt-6">
              <h3 className="font-bold text-gray-800 mb-4">Travel Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cities Visited</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Money Saved</span>
                  <span className="font-semibold">₹15,230</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            {/* Tabs */}
            <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-xl">
              {[
                { id: "bookings", label: "My Bookings" },
                { id: "wallet", label: "Wallet" },
                { id: "profile", label: "Profile" },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id ? "bg-white text-sky-600 shadow-md" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Link href="/search" className="card hover:shadow-2xl transition-all duration-300 text-center group">
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-sky-200 transition-colors">
                      <Plane className="w-6 h-6 text-sky-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Book New Journey</h3>
                    <p className="text-gray-600 text-sm">Search and book your next trip</p>
                  </Link>

                  <Link href="/wallet" className="card hover:shadow-2xl transition-all duration-300 text-center group">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Manage Wallet</h3>
                    <p className="text-gray-600 text-sm">Add funds and view transactions</p>
                  </Link>

                  <div className="card hover:shadow-2xl transition-all duration-300 text-center group cursor-pointer">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Trip Planner</h3>
                    <p className="text-gray-600 text-sm">Plan your upcoming trips</p>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Recent Bookings</h2>
                    <Link href="#" className="text-sky-500 hover:text-sky-600 font-semibold">
                      View All
                    </Link>
                  </div>

                  <div className="space-y-6">
                    {bookings.map((booking, index) => {
                      const TransportIcon = getTransportIcon(booking.type)
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="md:w-32 h-20 md:h-auto">
                            <Image
                              src={booking.image || "/placeholder.svg"}
                              alt={booking.provider}
                              width={128}
                              height={80}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <TransportIcon className="w-5 h-5 text-sky-600" />
                                <div>
                                  <h3 className="font-bold text-gray-800">{booking.provider}</h3>
                                  <p className="text-gray-600">
                                    {booking.from} → {booking.to}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(booking.status)} w-fit`}
                              >
                                {booking.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {booking.date}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {booking.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {booking.type}
                              </div>
                              <div className="text-gray-500">Ref: {booking.bookingRef}</div>
                            </div>

                            <div className="flex justify-end mt-4 space-x-2">
                              {booking.status === "confirmed" && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    Modify
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    Cancel
                                  </motion.button>
                                </>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                className="px-4 py-2 text-sm bg-sky-50 text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
                              >
                                View Details
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Wallet Overview</h2>
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Manage your wallet from the dedicated wallet page</p>
                  <Link href="/wallet" className="btn-primary">
                    Go to Wallet
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        defaultValue="Priya"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        defaultValue="Sharma"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue="priya.sharma@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+91 98765 43210"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary"
                  >
                    Update Profile
                  </motion.button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
