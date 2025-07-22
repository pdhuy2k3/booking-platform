'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CustomerProfile, customerService, UpdateProfileRequest } from '@/lib/customer-service'
import {
  emailSchema,
  phoneSchema,
  passportSchema,
  dateOfBirthSchema,
  passportExpirySchema,
  getApiErrorMessage,
  withErrorHandling,
  focusFirstError
} from '@/lib/validation-utils'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from 'sonner'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  CreditCard,
  Camera,
  Edit,
  Save,
  X,
  Upload
} from 'lucide-react'
import { ProfilePhotoUpload } from './ProfilePhotoUpload'

const profileSchema = z.object({
  firstName: z.string().min(1, 'Tên không được để trống').max(50, 'Tên không được quá 50 ký tự'),
  lastName: z.string().min(1, 'Họ không được để trống').max(50, 'Họ không được quá 50 ký tự'),
  phone: phoneSchema,
  dateOfBirth: dateOfBirthSchema,
  nationality: z.string().optional(),
  passportNumber: passportSchema,
  passportExpiry: passportExpirySchema,
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  preferences: z.object({
    language: z.string().optional(),
    currency: z.string().optional(),
    marketing: z.boolean().optional(),
  }).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileInfoProps {
  profile: CustomerProfile
  onUpdate: (profile: CustomerProfile) => void
}

export function ProfileInfo({ profile, onUpdate }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      dateOfBirth: profile.dateOfBirth || '',
      nationality: profile.nationality || '',
      passportNumber: profile.passportNumber || '',
      passportExpiry: profile.passportExpiry || '',
      address: {
        street: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        country: profile.address?.country || '',
        postalCode: profile.address?.postalCode || '',
      },
      preferences: {
        language: profile.preferences?.language || 'vi',
        currency: profile.preferences?.currency || 'VND',
        marketing: profile.preferences?.marketing || false,
      },
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    const result = await withErrorHandling(
      async () => {
        setLoading(true)
        const updateData: UpdateProfileRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          passportNumber: data.passportNumber,
          passportExpiry: data.passportExpiry,
          address: data.address,
          preferences: data.preferences,
        }

        return await customerService.updateProfile(updateData)
      },
      (updatedProfile) => {
        onUpdate(updatedProfile)
        setIsEditing(false)
        toast.success('Cập nhật thông tin thành công!')
      },
      (error) => {
        toast.error(error)
        // Focus on first error field if validation failed
        setTimeout(() => focusFirstError(formRef), 100)
      }
    )

    setLoading(false)
  }



  const countries = [
    { code: 'VN', name: 'Việt Nam' },
    { code: 'US', name: 'Hoa Kỳ' },
    { code: 'JP', name: 'Nhật Bản' },
    { code: 'KR', name: 'Hàn Quốc' },
    { code: 'CN', name: 'Trung Quốc' },
    { code: 'TH', name: 'Thái Lan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'MY', name: 'Malaysia' },
  ]

  const languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
  ]

  const currencies = [
    { code: 'VND', name: 'VND (₫)' },
    { code: 'USD', name: 'USD ($)' },
    { code: 'JPY', name: 'JPY (¥)' },
    { code: 'KRW', name: 'KRW (₩)' },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Ảnh đại diện</span>
          </CardTitle>
          <CardDescription>
            Cập nhật ảnh đại diện của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.photoUrl} alt={profile.firstName} />
              <AvatarFallback className="text-xl">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <ProfilePhotoUpload
                currentPhotoUrl={profile.photoUrl}
                onPhotoUpdated={(photoUrl) => {
                  const updatedProfile = { ...profile, photoUrl }
                  onUpdate(updatedProfile)
                }}
              />
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG hoặc GIF. Tối đa 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin cơ bản</span>
              </CardTitle>
              <CardDescription>
                Thông tin cá nhân và liên hệ
              </CardDescription>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => {
                if (isEditing) {
                  form.reset()
                }
                setIsEditing(!isEditing)
              }}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập họ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder="+84 xxx xxx xxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày sinh</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quốc tịch</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn quốc tịch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="passportNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số hộ chiếu</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số hộ chiếu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="passportExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày hết hạn hộ chiếu</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Địa chỉ</h3>
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ</FormLabel>
                        <FormControl>
                          <Input placeholder="Số nhà, tên đường" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thành phố</FormLabel>
                          <FormControl>
                            <Input placeholder="Thành phố" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tỉnh/Thành</FormLabel>
                          <FormControl>
                            <Input placeholder="Tỉnh/Thành" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quốc gia</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn quốc gia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã bưu điện</FormLabel>
                          <FormControl>
                            <Input placeholder="Mã bưu điện" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tùy chọn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preferences.language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngôn ngữ</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn ngôn ngữ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferences.currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiền tệ</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn tiền tệ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.code} value={currency.code}>
                                  {currency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="preferences.marketing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Nhận thông tin khuyến mãi
                          </FormLabel>
                          <FormDescription>
                            Nhận email về các chương trình khuyến mãi và ưu đãi đặc biệt
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset()
                      setIsEditing(false)
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Save className="h-4 w-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tên</Label>
                  <p className="mt-1">{profile.firstName || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Họ</Label>
                  <p className="mt-1">{profile.lastName || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="mt-1 flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{profile.email}</span>
                    {profile.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Đã xác thực
                      </Badge>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Số điện thoại</Label>
                  <p className="mt-1 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{profile.phone || 'Chưa cập nhật'}</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ngày sinh</Label>
                  <p className="mt-1 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Quốc tịch</Label>
                  <p className="mt-1 flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span>{countries.find(c => c.code === profile.nationality)?.name || profile.nationality || 'Chưa cập nhật'}</span>
                  </p>
                </div>
              </div>

              {/* Passport Information */}
              {(profile.passportNumber || profile.passportExpiry) && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Thông tin hộ chiếu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Số hộ chiếu</Label>
                      <p className="mt-1 flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span>{profile.passportNumber || 'Chưa cập nhật'}</span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Ngày hết hạn</Label>
                      <p className="mt-1 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{profile.passportExpiry ? new Date(profile.passportExpiry).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Information */}
              {profile.address && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Địa chỉ</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Địa chỉ</Label>
                      <p className="mt-1 flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{profile.address.street || 'Chưa cập nhật'}</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Thành phố</Label>
                        <p className="mt-1">{profile.address.city || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Tỉnh/Thành</Label>
                        <p className="mt-1">{profile.address.state || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Quốc gia</Label>
                        <p className="mt-1">{countries.find(c => c.code === profile.address?.country)?.name || profile.address?.country || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Mã bưu điện</Label>
                        <p className="mt-1">{profile.address.postalCode || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Tùy chọn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ngôn ngữ</Label>
                    <p className="mt-1">{languages.find(l => l.code === profile.preferences?.language)?.name || 'Tiếng Việt'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tiền tệ</Label>
                    <p className="mt-1">{currencies.find(c => c.code === profile.preferences?.currency)?.name || 'VND (₫)'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-500">Nhận thông tin khuyến mãi</Label>
                  <p className="mt-1">
                    <Badge variant={profile.preferences?.marketing ? "default" : "secondary"}>
                      {profile.preferences?.marketing ? 'Đã bật' : 'Đã tắt'}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
