'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { customerService, CustomerProfile } from '@/lib/customer-service'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from 'sonner'
import {
  User,
  FileText,
  Users,
  Gift,
  Bell,
  Shield,
  Camera,
  Crown,
  Star,
  Calendar,
  CreditCard,
  Settings
} from 'lucide-react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chat-bot"
import ErrorBoundary, { ProfileErrorFallback } from "@/components/ErrorBoundary"
import { ProfileSkeleton } from "@/components/ui/loading"

// Import components (will be created next)
import { ProfileInfo } from '@/components/profile/ProfileInfo'
import { TravelDocuments } from '@/components/profile/TravelDocuments'
import { SavedTravelers } from '@/components/profile/SavedTravelers'
import { LoyaltyProgram } from '@/components/profile/LoyaltyProgram'
import { NotificationSettings } from '@/components/profile/NotificationSettings'
import { AccountSecurity } from '@/components/profile/AccountSecurity'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('profile')

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile()
    }
  }, [isAuthenticated])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const profileData = await customerService.getProfile()
      setProfile(profileData)
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Không thể tải thông tin profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = (updatedProfile: CustomerProfile) => {
    setProfile(updatedProfile)
    toast.success('Cập nhật thông tin thành công!')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Yêu cầu đăng nhập</CardTitle>
              <CardDescription>
                Bạn cần đăng nhập để xem thông tin profile
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <a href="/auth/login">Đăng nhập</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return <ProfileSkeletonPage />
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Lỗi tải dữ liệu</CardTitle>
              <CardDescription>
                Không thể tải thông tin profile. Vui lòng thử lại.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={loadProfile}>Thử lại</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800'
      case 'GOLD': return 'bg-yellow-100 text-yellow-800'
      case 'SILVER': return 'bg-gray-100 text-gray-800'
      default: return 'bg-orange-100 text-orange-800'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return <Crown className="h-3 w-3" />
      case 'GOLD': return <Star className="h-3 w-3" />
      default: return null
    }
  }

  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'documents', label: 'Tài liệu du lịch', icon: FileText },
    { id: 'travelers', label: 'Người đi cùng', icon: Users },
    { id: 'loyalty', label: 'Điểm thưởng', icon: Gift },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileInfo profile={profile} onUpdate={handleProfileUpdate} />
      case 'documents':
        return <TravelDocuments />
      case 'travelers':
        return <SavedTravelers />
      case 'loyalty':
        return <LoyaltyProgram profile={profile} />
      case 'notifications':
        return <NotificationSettings profile={profile} onUpdate={handleProfileUpdate} />
      case 'security':
        return <AccountSecurity />
      default:
        return <ProfileInfo profile={profile} onUpdate={handleProfileUpdate} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {/* Mobile Navigation */}
            <div className="lg:hidden mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profile.photoUrl} alt={profile.firstName} />
                      <AvatarFallback className="text-sm">
                        {profile.firstName?.[0]}{profile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{profile.firstName} {profile.lastName}</h3>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Button
                          key={item.id}
                          variant={activeSection === item.id ? "default" : "outline"}
                          size="sm"
                          className="justify-start"
                          onClick={() => setActiveSection(item.id)}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">{item.label}</span>
                          <span className="sm:hidden">{item.label.split(' ')[0]}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Card>
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <Avatar className="w-20 h-20 mx-auto">
                      <AvatarImage src={profile.photoUrl} alt={profile.firstName} />
                      <AvatarFallback className="text-lg">
                        {profile.firstName?.[0]}{profile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => setActiveSection('profile')}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle>{profile.firstName} {profile.lastName}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                  <div className="flex justify-center space-x-2 mt-2">
                    {profile.isVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        Đã xác thực
                      </Badge>
                    )}
                    {profile.loyaltyProgram && (
                      <Badge className={getTierColor(profile.loyaltyProgram.tier)}>
                        {getTierIcon(profile.loyaltyProgram.tier)}
                        {profile.loyaltyProgram.tier}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant={activeSection === item.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveSection(item.id)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Loyalty Points Card - Desktop Only */}
            {profile.loyaltyProgram && (
              <Card className="mt-4 hidden lg:block">
                <CardHeader>
                  <CardTitle className="text-sm">Điểm thưởng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.loyaltyProgram.points.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Còn {(profile.loyaltyProgram.nextTierPoints - profile.loyaltyProgram.points).toLocaleString()} điểm để lên hạng
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {menuItems.find(item => item.id === activeSection)?.label || 'Profile'}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Quản lý thông tin cá nhân và cài đặt tài khoản
              </p>
            </div>

            <ErrorBoundary fallback={ProfileErrorFallback}>
              {renderContent()}
            </ErrorBoundary>
          </div>
        </div>
      </div>

      <Footer />
      <ChatBot />
    </div>
  )
}

function ProfileSkeletonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <ProfileSkeleton />
      </div>
      <Footer />
    </div>
  )
}
