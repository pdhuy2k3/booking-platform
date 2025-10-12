"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaSelector } from "@/components/ui/media-selector"
import type { Airport, MediaResponse } from "@/types/api"

interface AirportFormData {
  name: string
  iataCode: string
  city: string
  country: string
  timezone?: string
  latitude?: number
  longitude?: number
}

interface AirportFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AirportFormData & { mediaPublicIds: string[]; featuredMediaUrl?: string | null }) => void
  isSubmitting: boolean
  editingAirport?: Airport | null
  title: string
  description: string
}

export function AirportFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingAirport,
  title,
  description
}: AirportFormDialogProps) {
  const [formData, setFormData] = useState<AirportFormData>({
    name: "",
    iataCode: "",
    city: "",
    country: "",
    timezone: "",
    latitude: undefined,
    longitude: undefined
  })
  const [media, setMedia] = useState<MediaResponse[]>([])
  const [errors, setErrors] = useState<Partial<AirportFormData>>({})

  useEffect(() => {
    if (editingAirport) {
      setFormData({
        name: editingAirport.name,
        iataCode: editingAirport.iataCode,
        city: editingAirport.city,
        country: editingAirport.country,
        timezone: editingAirport.timezone || "",
        latitude: editingAirport.latitude,
        longitude: editingAirport.longitude
      })
      setMedia(editingAirport.media || [])
    } else {
      resetForm()
    }
  }, [editingAirport, isOpen])

  const resetForm = () => {
    setFormData({
      name: "",
      iataCode: "",
      city: "",
      country: "",
      timezone: "",
      latitude: undefined,
      longitude: undefined
    })
    setMedia([])
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AirportFormData> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên sân bay là bắt buộc"
    }
    
    if (!formData.iataCode.trim()) {
      newErrors.iataCode = "Mã IATA là bắt buộc"
    } else if (formData.iataCode.length !== 3) {
      newErrors.iataCode = "Mã IATA phải có đúng 3 ký tự"
    }
    
    if (!formData.city.trim()) {
      newErrors.city = "Thành phố là bắt buộc"
    }
    
    if (!formData.country.trim()) {
      newErrors.country = "Quốc gia là bắt buộc"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    
    onSubmit({
      ...formData,
      mediaPublicIds: media.map(m => m.publicId),
      featuredMediaUrl: media[0]?.secureUrl || null
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên sân bay *</Label>
            <Input
              id="name"
              placeholder="Sân bay Quốc tế Nội Bài"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="iataCode">Mã IATA *</Label>
            <Input
              id="iataCode"
              placeholder="HAN"
              maxLength={3}
              value={formData.iataCode}
              onChange={(e) => setFormData({ ...formData, iataCode: e.target.value.toUpperCase() })}
              className={errors.iataCode ? "border-red-500" : ""}
            />
            {errors.iataCode && <p className="text-sm text-red-500">{errors.iataCode}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Thành phố *</Label>
              <Input
                id="city"
                placeholder="Hà Nội"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Quốc gia *</Label>
              <Input
                id="country"
                placeholder="Vietnam"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Múi giờ</Label>
            <Input
              id="timezone"
              placeholder="Asia/Ho_Chi_Minh"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="21.221200"
                value={formData.latitude ?? ""}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
              <p className="text-xs text-gray-500">Phạm vi: -90 đến 90</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="105.807200"
                value={formData.longitude ?? ""}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
              <p className="text-xs text-gray-500">Phạm vi: -180 đến 180</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hình ảnh sân bay</Label>
            <MediaSelector
              value={media}
              onMediaChange={setMedia}
              folder="airports"
              maxSelection={5}
              allowUpload={true}
              mode="publicIds"
            />
          </div>
        </div>

        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.name.trim() || !formData.iataCode.trim() || !formData.city.trim() || !formData.country.trim()}
            >
              {isSubmitting ? "Đang xử lý..." : (editingAirport ? "Cập nhật" : "Tạo sân bay")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
