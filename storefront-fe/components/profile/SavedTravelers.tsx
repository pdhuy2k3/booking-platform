'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { customerService, SavedTraveler } from '@/lib/customer-service'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from 'sonner'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  User,
  CreditCard,
  Star,
  Save,
  X
} from 'lucide-react'

const travelerSchema = z.object({
  firstName: z.string().min(1, 'Tên không được để trống'),
  lastName: z.string().min(1, 'Họ không được để trống'),
  dateOfBirth: z.string().min(1, 'Ngày sinh không được để trống'),
  nationality: z.string().min(1, 'Quốc tịch không được để trống'),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  relationship: z.string().min(1, 'Mối quan hệ không được để trống'),
  isFrequentTraveler: z.boolean().default(false),
})

type TravelerFormData = z.infer<typeof travelerSchema>

export function SavedTravelers() {
  const [travelers, setTravelers] = useState<SavedTraveler[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTraveler, setEditingTraveler] = useState<SavedTraveler | null>(null)

  const form = useForm<TravelerFormData>({
    resolver: zodResolver(travelerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
      relationship: '',
      isFrequentTraveler: false,
    },
  })

  useEffect(() => {
    loadTravelers()
  }, [])

  const loadTravelers = async () => {
    try {
      setLoading(true)
      const data = await customerService.getSavedTravelers()
      setTravelers(data)
    } catch (error) {
      console.error('Failed to load travelers:', error)
      toast.error('Không thể tải danh sách người đi cùng')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: TravelerFormData) => {
    try {
      setSaving(true)
      
      if (editingTraveler) {
        // Update existing traveler
        const updatedTraveler = await customerService.updateSavedTraveler(editingTraveler.id, data)
        setTravelers(travelers.map(t => t.id === editingTraveler.id ? updatedTraveler : t))
        toast.success('Cập nhật thông tin thành công!')
      } else {
        // Add new traveler
        const newTraveler = await customerService.addSavedTraveler(data)
        setTravelers([...travelers, newTraveler])
        toast.success('Thêm người đi cùng thành công!')
      }
      
      setIsDialogOpen(false)
      setEditingTraveler(null)
      form.reset()
    } catch (error) {
      console.error('Failed to save traveler:', error)
      toast.error('Không thể lưu thông tin. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (traveler: SavedTraveler) => {
    setEditingTraveler(traveler)
    form.reset({
      firstName: traveler.firstName,
      lastName: traveler.lastName,
      dateOfBirth: traveler.dateOfBirth,
      nationality: traveler.nationality,
      passportNumber: traveler.passportNumber || '',
      passportExpiry: traveler.passportExpiry || '',
      relationship: traveler.relationship,
      isFrequentTraveler: traveler.isFrequentTraveler,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (travelerId: string) => {
    try {
      await customerService.deleteSavedTraveler(travelerId)
      setTravelers(travelers.filter(t => t.id !== travelerId))
      toast.success('Xóa người đi cùng thành công!')
    } catch (error) {
      console.error('Failed to delete traveler:', error)
      toast.error('Không thể xóa. Vui lòng thử lại.')
    }
  }

  const handleAddNew = () => {
    setEditingTraveler(null)
    form.reset()
    setIsDialogOpen(true)
  }

  const relationships = [
    { value: 'SELF', label: 'Bản thân' },
    { value: 'SPOUSE', label: 'Vợ/Chồng' },
    { value: 'CHILD', label: 'Con' },
    { value: 'PARENT', label: 'Cha/Mẹ' },
    { value: 'SIBLING', label: 'Anh/Chị/Em' },
    { value: 'FRIEND', label: 'Bạn bè' },
    { value: 'OTHER', label: 'Khác' },
  ]

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

  const getRelationshipLabel = (relationship: string) => {
    return relationships.find(r => r.value === relationship)?.label || relationship
  }

  const getCountryName = (code: string) => {
    return countries.find(c => c.code === code)?.name || code
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Người đi cùng đã lưu</CardTitle>
            <CardDescription>Quản lý danh sách người đi cùng thường xuyên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Người đi cùng đã lưu</span>
              </CardTitle>
              <CardDescription>
                Lưu thông tin người đi cùng để đặt chỗ nhanh chóng hơn
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm người đi cùng
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingTraveler ? 'Chỉnh sửa thông tin' : 'Thêm người đi cùng'}
                  </DialogTitle>
                  <DialogDescription>
                    Nhập thông tin chi tiết của người đi cùng
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="passportNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số hộ chiếu (tùy chọn)</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập số hộ chiếu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="passportExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ngày hết hạn hộ chiếu (tùy chọn)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mối quan hệ</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn mối quan hệ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {relationships.map((rel) => (
                                <SelectItem key={rel.value} value={rel.value}>
                                  {rel.label}
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
                      name="isFrequentTraveler"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Khách hàng thường xuyên
                            </FormLabel>
                            <div className="text-sm text-gray-500">
                              Đánh dấu là người đi cùng thường xuyên
                            </div>
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

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingTraveler(null)
                          form.reset()
                        }}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <Save className="h-4 w-4 mr-2 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {editingTraveler ? 'Cập nhật' : 'Thêm mới'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {travelers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có người đi cùng nào
              </h3>
              <p className="text-gray-500 mb-4">
                Thêm thông tin người đi cùng để đặt chỗ nhanh chóng hơn
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm người đi cùng đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {travelers.map((traveler) => (
                <div key={traveler.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {traveler.firstName} {traveler.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(traveler.dateOfBirth).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getCountryName(traveler.nationality)}
                          </span>
                          <span>{getRelationshipLabel(traveler.relationship)}</span>
                          {traveler.passportNumber && (
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {traveler.passportNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {traveler.isFrequentTraveler && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Thường xuyên
                        </Badge>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(traveler)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa người đi cùng</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa {traveler.firstName} {traveler.lastName} khỏi danh sách? 
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(traveler.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
