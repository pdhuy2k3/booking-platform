'use client'

import { useState, useEffect } from 'react'
import { customerService, CustomerProfile } from '@/modules/profile/api'
import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Switch } from "@/common/components/ui/switch"
import { Label } from "@/common/components/ui/label"
import { Separator } from "@/common/components/ui/separator"
import { toast } from 'sonner'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Gift,
  Plane,
  Hotel,
  CreditCard,
  AlertCircle,
  Save
} from 'lucide-react'

interface NotificationSettingsProps {
  profile: CustomerProfile
  onUpdate: (profile: CustomerProfile) => void
}

export function NotificationSettings({ profile, onUpdate }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadNotificationPreferences()
  }, [])

  const loadNotificationPreferences = async () => {
    try {
      setLoading(true)
      const data = await customerService.getNotificationPreferences()
      setPreferences(data)
    } catch (error) {
      console.error('Failed to load notification preferences:', error)
      // Fallback to profile preferences
      setPreferences({
        email: profile.preferences?.notifications?.email || true,
        sms: profile.preferences?.notifications?.sms || false,
        push: profile.preferences?.notifications?.push || true,
        marketing: profile.preferences?.marketing || false,
        bookingUpdates: true,
        promotions: profile.preferences?.marketing || false,
        newsletter: profile.preferences?.marketing || false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences({
      ...preferences,
      [key]: value
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await customerService.updateNotificationPreferences(preferences)
      
      // Update profile with new preferences
      const updatedProfile = {
        ...profile,
        preferences: {
          ...profile.preferences,
          notifications: {
            email: preferences.email,
            sms: preferences.sms,
            push: preferences.push,
          },
          marketing: preferences.marketing,
        }
      }
      
      onUpdate(updatedProfile)
      toast.success('Cập nhật cài đặt thông báo thành công!')
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      toast.error('Không thể cập nhật cài đặt. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Cài đặt thông báo</span>
          </CardTitle>
          <CardDescription>
            Quản lý cách bạn nhận thông báo từ BookingSmart
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Communication Channels */}
          <div>
            <h3 className="text-lg font-medium mb-4">Kênh thông báo</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-base font-medium">Email</Label>
                    <p className="text-sm text-gray-500">
                      Nhận thông báo qua email tại {profile.email}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.email || false}
                  onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <Label className="text-base font-medium">SMS</Label>
                    <p className="text-sm text-gray-500">
                      Nhận tin nhắn SMS tại {profile.phone || 'Chưa cập nhật số điện thoại'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.sms || false}
                  onCheckedChange={(checked) => handlePreferenceChange('sms', checked)}
                  disabled={!profile.phone}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <div>
                    <Label className="text-base font-medium">Push Notification</Label>
                    <p className="text-sm text-gray-500">
                      Nhận thông báo đẩy trên thiết bị di động
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.push || false}
                  onCheckedChange={(checked) => handlePreferenceChange('push', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div>
            <h3 className="text-lg font-medium mb-4">Loại thông báo</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Plane className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-base font-medium">Cập nhật đặt chỗ</Label>
                    <p className="text-sm text-gray-500">
                      Thông báo về trạng thái đặt chỗ, thay đổi lịch trình
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.bookingUpdates !== false}
                  onCheckedChange={(checked) => handlePreferenceChange('bookingUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Gift className="h-5 w-5 text-red-600" />
                  <div>
                    <Label className="text-base font-medium">Khuyến mãi & Ưu đãi</Label>
                    <p className="text-sm text-gray-500">
                      Thông báo về các chương trình khuyến mãi đặc biệt
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.promotions || false}
                  onCheckedChange={(checked) => handlePreferenceChange('promotions', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  <div>
                    <Label className="text-base font-medium">Newsletter</Label>
                    <p className="text-sm text-gray-500">
                      Bản tin định kỳ về xu hướng du lịch và mẹo hay
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.newsletter || false}
                  onCheckedChange={(checked) => handlePreferenceChange('newsletter', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <Label className="text-base font-medium">Giao dịch thanh toán</Label>
                    <p className="text-sm text-gray-500">
                      Thông báo về các giao dịch thanh toán và hoàn tiền
                    </p>
                  </div>
                </div>
                <Switch
                  checked={true}
                  disabled={true}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <Label className="text-base font-medium">Thông báo bảo mật</Label>
                    <p className="text-sm text-gray-500">
                      Cảnh báo về hoạt động đăng nhập và bảo mật tài khoản
                    </p>
                  </div>
                </div>
                <Switch
                  checked={true}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Marketing Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-4">Tùy chọn marketing</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Gift className="h-5 w-5 text-pink-600" />
                  <div>
                    <Label className="text-base font-medium">Nhận thông tin marketing</Label>
                    <p className="text-sm text-gray-500">
                      Cho phép BookingSmart gửi thông tin quảng cáo và khuyến mãi
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.marketing || false}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                />
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Lưu ý quan trọng</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Một số thông báo quan trọng như xác nhận đặt chỗ, thông báo bảo mật và giao dịch thanh toán 
                  sẽ luôn được gửi để đảm bảo an toàn cho tài khoản của bạn.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu cài đặt
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
