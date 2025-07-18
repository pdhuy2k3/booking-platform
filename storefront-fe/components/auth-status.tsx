'use client'

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react"

export function AuthStatus() {
  const { isAuthenticated, user, userProfile, isLoading, login, logout, refreshAuth, refreshProfile } = useAuth()

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Đang kiểm tra trạng thái đăng nhập...</span>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Chưa đăng nhập</CardTitle>
          <CardDescription>
            Bạn cần đăng nhập để sử dụng đầy đủ tính năng của BookingSmart
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={login} className="w-full">
            Đăng nhập
          </Button>
          <Button onClick={refreshAuth} variant="outline" className="w-full">
            Kiểm tra lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin tài khoản
            </CardTitle>
            <CardDescription>
              Trạng thái đăng nhập và thông tin cá nhân
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Đã đăng nhập
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Auth Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Thông tin đăng nhập</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Username:</span>
              <span>{user?.username}</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        {userProfile ? (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Thông tin cá nhân</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">Họ tên</span>
                </div>
                <span>{userProfile.firstName} {userProfile.lastName}</span>
              </div>
              
              {userProfile.email && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">Email</span>
                  </div>
                  <span>{userProfile.email}</span>
                </div>
              )}
              
              {userProfile.phone && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">Số điện thoại</span>
                  </div>
                  <span>{userProfile.phone}</span>
                </div>
              )}
              
              {userProfile.nationality && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">Quốc tịch</span>
                  </div>
                  <span>{userProfile.nationality}</span>
                </div>
              )}
              
              {userProfile.dateOfBirth && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">Ngày sinh</span>
                  </div>
                  <span>{new Date(userProfile.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">Trạng thái</span>
                </div>
                <div className="flex gap-2">
                  {userProfile.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Đã xác thực
                    </Badge>
                  )}
                  {userProfile.isActive && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      Hoạt động
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Loyalty Program */}
            {userProfile.loyaltyProgram && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h5 className="font-medium text-sm text-gray-700 mb-2">Chương trình khách hàng thân thiết</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Mã thành viên:</span>
                    <div className="font-medium">{userProfile.loyaltyProgram.memberId}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Hạng:</span>
                    <div className="font-medium">{userProfile.loyaltyProgram.tier}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Điểm hiện tại:</span>
                    <div className="font-medium">{userProfile.loyaltyProgram.points.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Điểm lên hạng:</span>
                    <div className="font-medium">{userProfile.loyaltyProgram.nextTierPoints.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              Không thể tải thông tin cá nhân. Vui lòng thử lại.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={refreshAuth} variant="outline" size="sm">
            Làm mới đăng nhập
          </Button>
          <Button onClick={refreshProfile} variant="outline" size="sm">
            Làm mới thông tin
          </Button>
          <Button onClick={logout} variant="destructive" size="sm" className="ml-auto">
            Đăng xuất
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
