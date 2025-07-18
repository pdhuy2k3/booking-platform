'use client'

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Plane, User, Settings, LogOut, Menu, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const { isAuthenticated, user, userProfile, isLoading, login, logout } = useAuth()
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BookingSmart</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/flights" className="text-gray-600 hover:text-gray-900 transition-colors">
              Chuyến bay
            </Link>
            <Link href="/hotels" className="text-gray-600 hover:text-gray-900 transition-colors">
              Khách sạn
            </Link>
            <Link href="/movies" className="text-gray-600 hover:text-gray-900 transition-colors">
              Phim ảnh
            </Link>
            <Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors">
              Hỗ trợ
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>

            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-500">Đang tải...</span>
              </div>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>
                        {userProfile ?
                          `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase() || 'U' :
                          user?.username?.[0]?.toUpperCase() || 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="px-2 py-1.5 text-sm text-gray-700">
                    <div className="font-medium">
                      {userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : user?.username}
                    </div>
                    {userProfile?.email && (
                      <div className="text-xs text-gray-500">{userProfile.email}</div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Tài khoản</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/booking" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Đặt chỗ của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={login} className="hidden md:inline-flex">
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
