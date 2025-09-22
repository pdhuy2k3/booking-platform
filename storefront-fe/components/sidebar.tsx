"use client"

import type { ElementType } from "react"
import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  MessageCircle,
  Search,
  Heart,
  Briefcase,
  Bell,
  Sparkles,
  Plus,
  Info,
  Settings,
  LogOut,
  UserRound,
  User,
  History,
  BarChart3,
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface NavItem {
  label: string
  icon: ElementType
  href?: string
  action?: () => void
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()

  const primaryNav: NavItem[] = useMemo(
    () => [
      { label: "Chats", icon: MessageCircle, href: "/" },
      { label: "Explore", icon: Search, href: "/explore" },
      { label: "Saved", icon: Heart, href: "/saved" },
      { label: "Trips", icon: Briefcase, href: "/trips" },
      { label: "Updates", icon: Bell, href: "/updates" },
      { label: "Inspiration", icon: Sparkles, href: "/inspiration" },
    ],
    [],
  )

  const secondaryNav: NavItem[] = useMemo(
    () => [
      { label: "Create", icon: Plus, href: "/create" },
    ],
    [],
  )

  const handleSettings = () => router.push("/dashboard#preferences")

  return (
    <aside className="w-16 shrink-0 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1">
      {/* Logo */}
      <Link
        href="/"
        className="flex h-10 w-10 items-center justify-center rounded-full mb-4"
        aria-label="mindtrip Home"
      >
        <div className="text-2xl font-bold">
          <span className="text-black">🧠</span>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {primaryNav.map((item) => {
          const isActive = item.href ? pathname === item.href : false
          const Icon = item.icon
          const content = (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
                isActive 
                  ? "bg-gray-900 text-white" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )

          if (item.href) {
            return (
              <Link key={item.label} href={item.href} aria-label={item.label} className="relative">
                {content}
                <span className="sr-only">{item.label}</span>
              </Link>
            )
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              aria-label={item.label}
              className="relative"
            >
              {content}
              <span className="sr-only">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="flex flex-col items-center gap-1 mb-4">
        {secondaryNav.map((item) => {
          const Icon = item.icon
          return item.href ? (
            <Link key={item.label} href={item.href} aria-label={item.label} className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200">
                <Icon className="h-5 w-5" />
              </div>
              <span className="sr-only">{item.label}</span>
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              onClick={item.action}
              className="relative"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200">
                <Icon className="h-5 w-5" />
              </div>
              <span className="sr-only">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* User Section */}
      <div className="flex flex-col items-center gap-2">
        {isLoading ? (
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
        ) : isAuthenticated && user ? (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="User menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 overflow-hidden bg-gray-50 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all duration-200"
                >
                  {user.picture ? (
                    <Image src={user.picture} alt={user.fullName} width={40} height={40} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-700 uppercase">
                      {user.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" align="end" className="w-56 p-2">
                <div className="flex items-center gap-3 p-2 border-b border-gray-100 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 overflow-hidden bg-gray-50">
                    {user.picture ? (
                      <Image src={user.picture} alt={user.fullName} width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-gray-700 uppercase">
                        {user.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard#profile"
                    className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    href="/dashboard#bookings"
                    className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <History className="h-4 w-4" />
                    Lịch sử đặt chỗ
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <button
            type="button"
            onClick={login}
            aria-label="Sign in"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
          >
            <UserRound className="h-5 w-5" />
          </button>
        )}

        {/* Help Button */}
        <Link href="/help" aria-label="Help" className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200">
            <Info className="h-5 w-5" />
          </div>
          <span className="sr-only">Help</span>
        </Link>
      </div>
    </aside>
  )
}
