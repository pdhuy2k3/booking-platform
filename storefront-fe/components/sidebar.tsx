"use client"

import { MessageSquare, Plane, Building2, User, LogOut, Settings, Calendar, CreditCard, ChevronUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

const navigation = [
  { name: "Chat", icon: MessageSquare, href: "/" },
  { name: "Flights", icon: Plane, href: "/flights" },
  { name: "Hotels", icon: Building2, href: "/hotels" },
  { name: "Bookings", icon: Calendar, href: "/bookings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()

  const userMenuOptions = [
    { name: "Dashboard", icon: User, action: () => router.push("/dashboard") },
    { name: "Payment", icon: CreditCard, action: () => router.push("/dashboard#payments") },
    { name: "Settings", icon: Settings, action: () => router.push("/dashboard#preferences") },
    { name: "Logout", icon: LogOut, action: () => logout() },
  ]

  const chatHistory = [
    "Weekend trip to Paris",
    "Business travel options",
    "Summer vacation planning",
    "Hotel booking in Tokyo",
    "Flight comparison NYC-LA",
    "European backpacking trip",
    "Luxury resorts in Maldives",
    "Budget travel to Southeast Asia",
    "Family vacation to Disney World",
    "Honeymoon destinations",
    "Solo travel safety tips",
    "Best time to visit Japan",
    "Ski resorts in Switzerland",
    "Beach holidays in Greece",
    "Cultural tours in Italy",
    "Adventure travel in New Zealand",
    "Food tours in Thailand",
    "Safari trips in Kenya",
    "Northern lights in Iceland",
    "City breaks in Europe",
  ]

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">TravelAI</span>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {navigation.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 mt-6">
          <div className="border-t border-sidebar-border"></div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="text-xs text-muted-foreground">Conversations</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1 min-h-0">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={cn(
              "text-sm truncate py-1 cursor-pointer hover:text-sidebar-foreground transition-colors",
              index === 0 ? "text-sidebar-foreground" : "text-muted-foreground",
            )}
          >
            {chat}
          </div>
        ))}
      </div>

      <div className="relative flex-shrink-0">
        {showUserMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-sidebar-accent border border-sidebar-border rounded-lg shadow-lg py-2 z-50">
            {userMenuOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => {
                  option.action()
                  setShowUserMenu(false)
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
              >
                <option.icon className="mr-3 h-4 w-4" />
                {option.name}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-sidebar-border">
          {isLoading ? (
            <div className="w-full flex items-center space-x-3 p-2 rounded-lg">
              <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-600 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ) : isAuthenticated && user ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden relative">
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-sidebar-foreground">{user.fullName}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <ChevronUp
                className={cn("h-4 w-4 text-muted-foreground transition-transform", showUserMenu && "rotate-180")}
              />
            </button>
          ) : (
            <button
              onClick={login}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-sidebar-foreground">Sign In</div>
                <div className="text-xs text-muted-foreground">Click to login</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
