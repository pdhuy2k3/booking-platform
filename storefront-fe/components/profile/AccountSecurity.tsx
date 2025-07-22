'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { customerService } from '@/lib/customer-service'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from 'sonner'
import { 
  Shield, 
  Key, 
  Smartphone,
  Monitor,
  MapPin,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  Save,
  QrCode,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export function AccountSecurity() {
  const [loginHistory, setLoginHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [changingPassword, setChangingPassword] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set())

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      setLoading(true)
      const history = await customerService.getLoginHistory(1, 10)
      setLoginHistory(history.sessions)
      // TODO: Check 2FA status from profile or separate endpoint
      setIs2FAEnabled(false)
    } catch (error) {
      console.error('Failed to load security data:', error)
      toast.error('Không thể tải thông tin bảo mật')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setChangingPassword(true)
      await customerService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      
      toast.success('Đổi mật khẩu thành công!')
      setIsPasswordDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Không thể đổi mật khẩu. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleEnable2FA = async () => {
    try {
      const result = await customerService.enable2FA()
      setQrCode(result.qrCode)
      setBackupCodes(result.backupCodes)
      setIs2FADialogOpen(true)
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
      toast.error('Không thể kích hoạt 2FA. Vui lòng thử lại.')
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Vui lòng nhập mã xác thực 6 số')
      return
    }

    try {
      await customerService.verify2FA(verificationCode)
      setIs2FAEnabled(true)
      setIs2FADialogOpen(false)
      setVerificationCode('')
      toast.success('Kích hoạt 2FA thành công!')
    } catch (error) {
      console.error('Failed to verify 2FA:', error)
      toast.error('Mã xác thực không đúng. Vui lòng thử lại.')
    }
  }

  const handleDisable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Vui lòng nhập mã xác thực 6 số')
      return
    }

    try {
      await customerService.disable2FA(verificationCode)
      setIs2FAEnabled(false)
      setVerificationCode('')
      toast.success('Tắt 2FA thành công!')
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      toast.error('Mã xác thực không đúng. Vui lòng thử lại.')
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await customerService.terminateSession(sessionId)
      setLoginHistory(loginHistory.filter(session => session.id !== sessionId))
      toast.success('Đã kết thúc phiên đăng nhập')
    } catch (error) {
      console.error('Failed to terminate session:', error)
      toast.error('Không thể kết thúc phiên đăng nhập')
    }
  }

  const handleTerminateAllSessions = async () => {
    try {
      await customerService.terminateAllSessions()
      setLoginHistory([])
      toast.success('Đã kết thúc tất cả phiên đăng nhập')
    } catch (error) {
      console.error('Failed to terminate all sessions:', error)
      toast.error('Không thể kết thúc tất cả phiên đăng nhập')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCodes(new Set([...copiedCodes, text]))
      toast.success('Đã sao chép vào clipboard')
      setTimeout(() => {
        setCopiedCodes(new Set([...copiedCodes].filter(code => code !== text)))
      }, 2000)
    } catch (error) {
      toast.error('Không thể sao chép')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bảo mật tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
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
      {/* Password Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Mật khẩu</span>
          </CardTitle>
          <CardDescription>
            Quản lý mật khẩu đăng nhập của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Mật khẩu đăng nhập</h3>
              <p className="text-sm text-gray-500">
                Cập nhật lần cuối: 30 ngày trước
              </p>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Đổi mật khẩu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Đổi mật khẩu</DialogTitle>
                  <DialogDescription>
                    Nhập mật khẩu hiện tại và mật khẩu mới
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu hiện tại</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu hiện tại"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu mới</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu mới"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu mới"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsPasswordDialogOpen(false)
                          form.reset()
                        }}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={changingPassword}>
                        {changingPassword ? (
                          <>
                            <Save className="h-4 w-4 mr-2 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Đổi mật khẩu
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Xác thực hai yếu tố (2FA)</span>
          </CardTitle>
          <CardDescription>
            Tăng cường bảo mật tài khoản với xác thực hai yếu tố
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Xác thực hai yếu tố</h3>
              <p className="text-sm text-gray-500">
                {is2FAEnabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'} - Sử dụng ứng dụng authenticator
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={is2FAEnabled ? "default" : "secondary"}>
                {is2FAEnabled ? 'Đã bật' : 'Đã tắt'}
              </Badge>
              {is2FAEnabled ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      Tắt 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tắt xác thực hai yếu tố</DialogTitle>
                      <DialogDescription>
                        Nhập mã xác thực từ ứng dụng authenticator để tắt 2FA
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Mã xác thực</Label>
                        <InputOTP
                          maxLength={6}
                          value={verificationCode}
                          onChange={setVerificationCode}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setVerificationCode('')}>
                          Hủy
                        </Button>
                        <Button onClick={handleDisable2FA} variant="destructive">
                          Tắt 2FA
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button onClick={handleEnable2FA}>
                  Kích hoạt 2FA
                </Button>
              )}
            </div>
          </div>

          {/* 2FA Setup Dialog */}
          <Dialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Kích hoạt xác thực hai yếu tố</DialogTitle>
                <DialogDescription>
                  Quét mã QR bằng ứng dụng authenticator và nhập mã xác thực
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* QR Code */}
                {qrCode && (
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white border rounded-lg">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Quét mã QR bằng Google Authenticator hoặc ứng dụng tương tự
                    </p>
                  </div>
                )}

                {/* Backup Codes */}
                {backupCodes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Mã khôi phục</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Lưu các mã này ở nơi an toàn. Bạn có thể sử dụng chúng để đăng nhập khi không có ứng dụng authenticator.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm font-mono">
                          <span>{code}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(code)}
                          >
                            {copiedCodes.has(code) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verification */}
                <div>
                  <Label>Nhập mã xác thực từ ứng dụng</Label>
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIs2FADialogOpen(false)
                      setVerificationCode('')
                      setQrCode('')
                      setBackupCodes([])
                    }}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleVerify2FA}>
                    Xác thực và kích hoạt
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Lịch sử đăng nhập</span>
              </CardTitle>
              <CardDescription>
                Theo dõi các phiên đăng nhập gần đây
              </CardDescription>
            </div>
            {loginHistory.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Kết thúc tất cả
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Kết thúc tất cả phiên đăng nhập</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn sẽ bị đăng xuất khỏi tất cả thiết bị và cần đăng nhập lại. 
                      Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleTerminateAllSessions}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Kết thúc tất cả
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loginHistory.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Không có lịch sử đăng nhập</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loginHistory.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {session.userAgent.includes('Mobile') ? 'Thiết bị di động' : 'Máy tính'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.loginAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span>IP: {session.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={session.isActive ? "default" : "secondary"}>
                      {session.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}
                    </Badge>
                    {session.isActive && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kết thúc phiên đăng nhập</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn kết thúc phiên đăng nhập này?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleTerminateSession(session.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Kết thúc
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
