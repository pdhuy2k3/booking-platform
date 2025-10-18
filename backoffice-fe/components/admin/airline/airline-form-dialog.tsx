"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaSelector } from "@/components/ui/media-selector"
import type { Airline, MediaResponse } from "@/types/api"

interface AirlineFormData {
  name: string
  iataCode: string
}

interface AirlineFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AirlineFormData & { mediaPublicIds: string[]; featuredMediaUrl?: string | null }) => void
  isSubmitting: boolean
  editingAirline?: Airline | null
  title: string
  description: string
}

export function AirlineFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingAirline,
  title,
  description
}: AirlineFormDialogProps) {
  const [formData, setFormData] = useState<AirlineFormData>({
    name: "",
    iataCode: ""
  })
  const [media, setMedia] = useState<MediaResponse[]>([])
  const [errors, setErrors] = useState<Partial<AirlineFormData>>({})

  useEffect(() => {
    if (editingAirline) {
      setFormData({
        name: editingAirline.name,
        iataCode: editingAirline.iataCode
      })
      setMedia(editingAirline.media || [])
    } else {
      resetForm()
    }
  }, [editingAirline, isOpen])

  const resetForm = () => {
    setFormData({
      name: "",
      iataCode: ""
    })
    setMedia([])
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AirlineFormData> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên hãng hàng không là bắt buộc"
    }
    
    if (!formData.iataCode.trim()) {
      newErrors.iataCode = "Mã IATA là bắt buộc"
    } else if (formData.iataCode.length !== 2) {
      newErrors.iataCode = "Mã IATA phải có đúng 2 ký tự"
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
            <Label htmlFor="name">
              Tên hãng hàng không
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Vietnam Airlines"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="iataCode">
              Mã IATA
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="iataCode"
              placeholder="VN"
              maxLength={2}
              value={formData.iataCode}
              onChange={(e) => setFormData({ ...formData, iataCode: e.target.value.toUpperCase() })}
              className={errors.iataCode ? "border-red-500" : ""}
            />
            {errors.iataCode && <p className="text-sm text-red-500">{errors.iataCode}</p>}
          </div>
          <div className="space-y-2">
            <Label>Logo hãng hàng không</Label>
            <MediaSelector
              value={media}
              onMediaChange={setMedia}
              folder="airlines"
              maxSelection={2}
              allowUpload={true}
              allowUrlInput={true}
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
              disabled={isSubmitting || !formData.name.trim() || formData.iataCode.trim().length !== 2}
            >
              {isSubmitting ? "Đang xử lý..." : (editingAirline ? "Cập nhật" : "Tạo hãng hàng không")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
