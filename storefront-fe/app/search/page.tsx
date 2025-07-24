"use client"

import React from "react"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Filter, Clock, MapPin, Star, Plane, Train, Bus, Car, Ship, CarTaxiFrontIcon as Taxi } from "lucide-react"

export default function SearchPage() {
  const [selectedMode, setSelectedMode] = useState("flight")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const transportOptions = {
    flight: [
      {
        id: "1",
        provider: "Air India",
        logo: "/placeholder.svg?height=40&width=40",
        from: "Delhi (DEL)",
        to: "Mumbai (BOM)",
        departure: "06:00",
        arrival: "08:30",
        duration: "2h 30m",
        price: 8500,
        class: "Economy",
        rating: 4.2,
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=200&fit=crop",
      },
      {
        id: "2",
        provider: "IndiGo",
        logo: "/placeholder.svg?height=40&width=40",
        from: "Delhi (DEL)",
        to: "Mumbai (BOM)",
        departure: "09:15",
        arrival: "11:45",
        duration: "2h 30m",
        price: 7200,
        class: "Economy",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop",
      },
    ],
    train: [
      {
        id: "3",
        provider: "Rajdhani Express",
        logo: "/placeholder.svg?height=40&width=40",
        from: "Delhi",
        to: "Mumbai",
        departure: "16:55",
        arrival: "08:35",
        duration: "15h 40m",
        price: 3500,
        class: "AC 2-Tier",
        rating: 4.0,
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop",
      },
    ],
    bus: [
      {
        id: "4",
        provider: "RedBus Volvo",
        logo: "/placeholder.svg?height=40&width=40",
        from: "Delhi",
        to: "Mumbai",
        departure: "20:00",
        arrival: "12:00",
        duration: "16h 00m",
        price: 1800,
        class: "AC Sleeper",
        rating: 4.1,
        image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=200&fit=crop",
      },
    ],
    taxi: [
      {
        id: "5",
        provider: "Ola Outstation",
        logo: "/placeholder.svg?height=40&width=40",
        from: "Delhi",
        to: "Mumbai",
        departure: "Anytime",
        arrival: "14h drive",
        duration: "14h 00m",
        price: 12000,
        class: "Sedan",
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop",
      },
    ],
    ferry: [
      {
        id: "6",
        provider: "Coastal Ferry",
        logo: "/placeholder.svg?height=40&width=40",
        from: "Mumbai",
        to: "Goa",
        departure: "08:00",
        arrival: "18:00",
        duration: "10h 00m",
        price: 2500,
        class: "Deluxe",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop",
      },
    ],
    car: [
      {
        id: "7",
        provider: "Zoomcar",
        logo: "/placeholder.svg?height=40&width=40",
        from: "Delhi",
        to: "Mumbai",
        departure: "Self Drive",
        arrival: "14h drive",
        duration: "14h 00m",
        price: 8000,
        class: "Hatchback",
        rating: 4.2,
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&h=200&fit=crop",
      },
    ],
  }

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

  const currentOptions = transportOptions[selectedMode as keyof typeof transportOptions] || []

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Results</h1>
          <p className="text-gray-600">Delhi to Mumbai • {currentOptions.length} options found</p>
        </motion.div>

        {/* Transport Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {Object.keys(transportOptions).map((mode) => {
            const IconComponent = getIcon(mode)
            return (
              <motion.button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  selectedMode === mode
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-md"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="capitalize">{mode}</span>
              </motion.button>
            )
          })}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:w-80">
            <div className="card sticky top-24">
              <div className="flex items-center mb-6">
                <Filter className="w-5 h-5 mr-2 text-sky-500" />
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                <input type="range" min="1000" max="20000" className="w-full accent-sky-500" />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>₹1,000</span>
                  <span>₹20,000</span>
                </div>
              </div>

              {/* Departure Time */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Departure Time</h3>
                <div className="space-y-2">
                  {[
                    { label: "Morning", time: "6AM-12PM" },
                    { label: "Afternoon", time: "12PM-6PM" },
                    { label: "Evening", time: "6PM-12AM" },
                    { label: "Night", time: "12AM-6AM" },
                  ].map((slot) => (
                    <label key={slot.label} className="flex items-center">
                      <input type="checkbox" className="mr-2 text-sky-500" />
                      <div>
                        <div className="font-medium text-sm">{slot.label}</div>
                        <div className="text-gray-500 text-xs">{slot.time}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input type="checkbox" className="mr-2 text-sky-500" />
                      <div className="flex items-center">
                        <span className="mr-1">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">& above</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <div className="flex-1">
            {/* Sort Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center mb-6"
            >
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Sort by:</span>
                <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500">
                  <option>Price (Low to High)</option>
                  <option>Price (High to Low)</option>
                  <option>Duration</option>
                  <option>Rating</option>
                </select>
              </div>
            </motion.div>

            {/* Transport Cards */}
            <div className="space-y-6">
              {currentOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image */}
                    <div className="lg:w-48 h-32 lg:h-auto">
                      <Image
                        src={option.image || "/placeholder.svg"}
                        alt={option.provider}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={option.logo || "/placeholder.svg"}
                            alt={option.provider}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div>
                            <h3 className="font-bold text-gray-800">{option.provider}</h3>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm text-gray-600">{option.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">₹{option.price.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{option.class}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-8">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-800">{option.departure}</div>
                            <div className="text-sm text-gray-600">{option.from}</div>
                          </div>

                          <div className="flex-1 flex items-center">
                            <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                              {React.createElement(getIcon(selectedMode), {
                                className:
                                  "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 bg-white",
                              })}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-800">{option.arrival}</div>
                            <div className="text-sm text-gray-600">{option.to}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {option.duration}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Direct
                          </div>
                        </div>

                        <Link href={`/booking/${selectedMode}/${option.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                          >
                            Book Now
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
