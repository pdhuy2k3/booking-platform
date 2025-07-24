"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Calendar, Users, Plane, Train, Bus, Car, Ship, CarTaxiFrontIcon as Taxi } from "lucide-react"
import Link from "next/link"

const transportModes = [
  { value: "flight", label: "Flight", icon: Plane },
  { value: "train", label: "Train", icon: Train },
  { value: "bus", label: "Bus", icon: Bus },
  { value: "taxi", label: "Taxi", icon: Taxi },
  { value: "ferry", label: "Ferry", icon: Ship },
  { value: "car", label: "Car", icon: Car },
]

export default function SearchBox() {
  const [selectedMode, setSelectedMode] = useState("flight")

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto"
    >
      {/* Transport Mode Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {transportModes.map((mode) => {
          const IconComponent = mode.icon
          return (
            <motion.button
              key={mode.value}
              onClick={() => setSelectedMode(mode.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                selectedMode === mode.value
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{mode.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Departure city"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Destination city"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Departure</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Passengers</label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300">
              <option>1 Passenger</option>
              <option>2 Passengers</option>
              <option>3 Passengers</option>
              <option>4+ Passengers</option>
            </select>
          </div>
        </div>

        <div className="flex items-end">
          <Link href="/search" className="w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full btn-primary flex items-center justify-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
