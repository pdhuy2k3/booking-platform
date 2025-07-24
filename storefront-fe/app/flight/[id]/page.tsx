"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { ArrowLeft, Plane, Clock, CreditCard, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function FlightDetailPage({ params }: { params: { id: string } }) {
  const [showWalletAlert, setShowWalletAlert] = useState(false)

  // Mock flight data
  const flight = {
    id: params.id,
    airline: "Air India",
    from: "Delhi (DEL)",
    to: "Mumbai (BOM)",
    departure: "06:00",
    arrival: "08:30",
    duration: "2h 30m",
    price: 8500,
    class: "Economy",
    aircraft: "Boeing 737-800",
    date: "2024-03-15",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop",
  }

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

        {/* Flight Image */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
            <Image src={flight.image || "/placeholder.svg"} alt="Airplane in flight" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{flight.airline}</h1>
              <p className="text-xl">
                {flight.from} → {flight.to}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Flight Summary */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Flight Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Departure</h3>
                  <div className="text-2xl font-bold text-gray-800">{flight.departure}</div>
                  <div className="text-gray-600">{flight.from}</div>
                  <div className="text-sm text-gray-500">March 15, 2024</div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Arrival</h3>
                  <div className="text-2xl font-bold text-gray-800">{flight.arrival}</div>
                  <div className="text-gray-600">{flight.to}</div>
                  <div className="text-sm text-gray-500">March 15, 2024</div>
                </div>
              </div>

              {/* Route Visualization */}
              <div className="mb-6">
                <div className="flex items-center justify-between relative">
                  <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  <div className="flex-1 mx-4 relative">
                    <div className="border-t-2 border-dashed border-gray-300"></div>
                    <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-sky-500 bg-white" />
                  </div>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Delhi</span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {flight.duration}
                  </span>
                  <span>Mumbai</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Aircraft</div>
                  <div className="font-semibold">{flight.aircraft}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Class</div>
                  <div className="font-semibold">{flight.class}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-semibold">{flight.duration}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Stops</div>
                  <div className="font-semibold">Non-stop</div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Included Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Free Wi-Fi",
                  "In-flight Entertainment",
                  "Complimentary Meal",
                  "Extra Legroom",
                  "Priority Boarding",
                  "Free Baggage",
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Book This Flight</h2>

              <div className="mb-6 p-4 bg-sky-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-semibold">₹{flight.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-semibold">₹1,200</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>₹{(flight.price + 1200).toLocaleString()}</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seat Preference</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                    <option>Window Seat</option>
                    <option>Aisle Seat</option>
                    <option>Middle Seat</option>
                    <option>No Preference</option>
                  </select>
                </div>

                <button type="button" onClick={handleBooking} className="w-full btn-primary">
                  <CreditCard className="inline-block w-5 h-5 mr-2" />
                  Confirm Booking
                </button>
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
