"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import {
  ArrowLeft,
  Clock,
  CreditCard,
  AlertTriangle,
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  CarTaxiFrontIcon as Taxi,
} from "lucide-react"
import Link from "next/link"

export default function BookingDetailPage({ params }: { params: { mode: string; id: string } }) {
  const [showWalletAlert, setShowWalletAlert] = useState(false)

  const getIcon = (mode: string) => {
    switch (mode) {
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

  const getImage = (mode: string) => {
    switch (mode) {
      case "flight":
        return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop"
      case "train":
        return "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop"
      case "bus":
        return "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=400&fit=crop"
      case "taxi":
        return "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop"
      case "ferry":
        return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop"
      case "car":
        return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop"
      default:
        return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop"
    }
  }

  // Mock booking data
  const booking = {
    id: params.id,
    provider: "Air India",
    from: "Delhi (DEL)",
    to: "Mumbai (BOM)",
    departure: "06:00",
    arrival: "08:30",
    duration: "2h 30m",
    price: 8500,
    class: "Economy",
    date: "2024-03-15",
    image: getImage(params.mode),
  }

  const IconComponent = getIcon(params.mode)

  const handleBooking = () => {
    setShowWalletAlert(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/search" className="flex items-center text-sky-500 hover:text-sky-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Search Results
          </Link>
        </motion.div>

        {/* Hero Image */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
            <Image
              src={booking.image || "/placeholder.svg"}
              alt={`${params.mode} booking`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center mb-2">
                <IconComponent className="h-8 w-8 mr-3" />
                <h1 className="text-3xl md:text-4xl font-bold">{booking.provider}</h1>
              </div>
              <p className="text-xl">
                {booking.from} → {booking.to}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Summary */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Departure</h3>
                  <div className="text-2xl font-bold text-gray-800">{booking.departure}</div>
                  <div className="text-gray-600">{booking.from}</div>
                  <div className="text-sm text-gray-500">March 15, 2024</div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Arrival</h3>
                  <div className="text-2xl font-bold text-gray-800">{booking.arrival}</div>
                  <div className="text-gray-600">{booking.to}</div>
                  <div className="text-sm text-gray-500">March 15, 2024</div>
                </div>
              </div>

              {/* Route Visualization */}
              <div className="mb-6">
                <div className="flex items-center justify-between relative">
                  <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  <div className="flex-1 mx-4 relative">
                    <div className="border-t-2 border-dashed border-gray-300"></div>
                    <IconComponent className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-sky-500 bg-white" />
                  </div>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Delhi</span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {booking.duration}
                  </span>
                  <span>Mumbai</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Provider</div>
                  <div className="font-semibold">{booking.provider}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Class</div>
                  <div className="font-semibold">{booking.class}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-semibold">{booking.duration}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-semibold capitalize">{params.mode}</div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Included Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Free Wi-Fi",
                  "Refreshments",
                  "Comfortable Seating",
                  "Air Conditioning",
                  "Entertainment",
                  "Customer Support",
                ].map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="card sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Booking</h2>

              <div className="mb-6 p-4 bg-sky-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-semibold">₹{booking.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-semibold">₹500</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>₹{(booking.price + 500).toLocaleString()}</span>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seat/Class Preference</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                    <option>Economy</option>
                    <option>Premium Economy</option>
                    <option>Business</option>
                    <option>First Class</option>
                  </select>
                </div>

                <motion.button
                  type="button"
                  onClick={handleBooking}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary"
                >
                  <CreditCard className="inline-block w-5 h-5 mr-2" />
                  Confirm Booking
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Wallet Alert Modal */}
        {showWalletAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Insufficient Funds</h3>
                <p className="text-gray-600 mb-6">
                  You don't have enough funds in your wallet to complete this booking. Please add funds to continue.
                </p>
                <div className="flex space-x-4">
                  <button onClick={() => setShowWalletAlert(false)} className="flex-1 btn-secondary">
                    Cancel
                  </button>
                  <Link href="/wallet" className="flex-1 btn-primary text-center">
                    Add Funds
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
