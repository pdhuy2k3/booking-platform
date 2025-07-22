'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { customerService, TravelDocument } from '@/lib/customer-service'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  Calendar,
  MapPin,
  Shield,
  Eye,
  X
} from 'lucide-react'

const documentSchema = z.object({
  type: z.string().min(1, 'Vui lòng chọn loại tài liệu'),
  documentNumber: z.string().min(1, 'Số tài liệu không được để trống'),
  issuingCountry: z.string().min(1, 'Vui lòng chọn quốc gia cấp'),
  expiryDate: z.string().min(1, 'Ngày hết hạn không được để trống'),
  file: z.any().refine((file) => file instanceof File, 'Vui lòng chọn file'),
})

type DocumentFormData = z.infer<typeof documentSchema>

export function TravelDocuments() {
  const [documents, setDocuments] = useState<TravelDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: '',
      documentNumber: '',
      issuingCountry: '',
      expiryDate: '',
    },
  })

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const docs = await customerService.getTravelDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Không thể tải danh sách tài liệu')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: DocumentFormData) => {
    try {
      setUploading(true)
      const newDocument = await customerService.uploadTravelDocument({
        type: data.type,
        documentNumber: data.documentNumber,
        issuingCountry: data.issuingCountry,
        expiryDate: data.expiryDate,
        file: data.file,
      })
      
      setDocuments([...documents, newDocument])
      setIsDialogOpen(false)
      form.reset()
      toast.success('Tải lên tài liệu thành công!')
    } catch (error) {
      console.error('Failed to upload document:', error)
      toast.error('Không thể tải lên tài liệu. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      await customerService.deleteTravelDocument(documentId)
      setDocuments(documents.filter(doc => doc.id !== documentId))
      toast.success('Xóa tài liệu thành công!')
    } catch (error) {
      console.error('Failed to delete document:', error)
      toast.error('Không thể xóa tài liệu. Vui lòng thử lại.')
    }
  }

  const documentTypes = [
    { value: 'PASSPORT', label: 'Hộ chiếu' },
    { value: 'ID_CARD', label: 'CMND/CCCD' },
    { value: 'DRIVER_LICENSE', label: 'Bằng lái xe' },
    { value: 'VISA', label: 'Visa' },
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

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find(dt => dt.value === type)?.label || type
  }

  const getCountryName = (code: string) => {
    return countries.find(c => c.code === code)?.name || code
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(now.getMonth() + 6)
    return expiry <= sixMonthsFromNow
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) <= new Date()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tài liệu du lịch</CardTitle>
                <CardDescription>Quản lý hộ chiếu, visa và các tài liệu du lịch khác</CardDescription>
              </div>
            </div>
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
                <FileText className="h-5 w-5" />
                <span>Tài liệu du lịch</span>
              </CardTitle>
              <CardDescription>
                Quản lý hộ chiếu, visa và các tài liệu du lịch khác
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm tài liệu
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Thêm tài liệu du lịch</DialogTitle>
                  <DialogDescription>
                    Tải lên tài liệu du lịch mới. File phải có định dạng JPG, PNG hoặc PDF.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại tài liệu</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại tài liệu" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {documentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="documentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số tài liệu</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập số tài liệu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="issuingCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quốc gia cấp</FormLabel>
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
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày hết hạn</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field: { onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>File tài liệu</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) onChange(file)
                              }}
                              {...field}
                            />
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
                          setIsDialogOpen(false)
                          form.reset()
                        }}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={uploading}>
                        {uploading ? (
                          <>
                            <Upload className="h-4 w-4 mr-2 animate-spin" />
                            Đang tải lên...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Tải lên
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
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có tài liệu nào
              </h3>
              <p className="text-gray-500 mb-4">
                Thêm tài liệu du lịch để dễ dàng quản lý và sử dụng khi đặt chỗ
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm tài liệu đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {getDocumentTypeLabel(document.type)}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>#{document.documentNumber}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getCountryName(document.issuingCountry)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Hết hạn: {new Date(document.expiryDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {document.isVerified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Đã xác thực
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Chờ xác thực
                        </Badge>
                      )}
                      
                      {isExpired(document.expiryDate) ? (
                        <Badge variant="destructive">
                          Đã hết hạn
                        </Badge>
                      ) : isExpiringSoon(document.expiryDate) ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Sắp hết hạn
                        </Badge>
                      ) : null}

                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa tài liệu</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(document.id)}
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
