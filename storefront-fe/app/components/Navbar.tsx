"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Plane, Menu, X, User, Wallet, Search, Home, Phone } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 shadow-sm border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              TravelHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/search"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </Link>
            <Link
              href="/wallet"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/login"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 space-y-4 border-t border-gray-100"
          >
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href="/search" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>
            <Link href="/contact" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </Link>
            <Link href="/wallet" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </Link>
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <User className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium py-2 px-6 rounded-xl transition-colors"
            >
              Login
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
