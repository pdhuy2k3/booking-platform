"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaSelector } from "@/components/ui/media-selector"
import type { Aircraft } from "@/types/api"

interface AircraftFormData {
  model: string
  manufacturer: string
  capacityEconomy: string
  capacityBusiness: string
  capacityFirst: string
  totalCapacity: string
  registrationNumber: string
}

interface AircraftFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AircraftFormData & { mediaPublicIds: string[] }) => void
  isSubmitting: boolean
  editingAircraft?: Aircraft | null
  title: string
  description: string
}

export function AircraftFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingAircraft,
  title,
  description
}: AircraftFormDialogProps) {
  const [formData, setFormData] = useState<AircraftFormData>({
    model: '',
    manufacturer: '',
    capacityEconomy: '',
    capacityBusiness: '',
    capacityFirst: '',
    totalCapacity: '',
    registrationNumber: ''
  })
  const [images, setImages] = useState<string[]>([])
  const [errors, setErrors] = useState<Partial<AircraftFormData>>({})

  useEffect(() => {
    if (editingAircraft) {
      setFormData({
        model: editingAircraft.model || '',
        manufacturer: editingAircraft.manufacturer || '',
        capacityEconomy: editingAircraft.capacityEconomy?.toString() || '',
        capacityBusiness: editingAircraft.capacityBusiness?.toString() || '',
        capacityFirst: editingAircraft.capacityFirst?.toString() || '',
        totalCapacity: editingAircraft.totalCapacity?.toString() || '',
        registrationNumber: editingAircraft.registrationNumber || ''
      })
      setImages(editingAircraft.media?.map(m => m.publicId) || [])
    } else {
      resetForm()
    }
  }, [editingAircraft, isOpen])

  const resetForm = () => {
    setFormData({
      model: '',
      manufacturer: '',
      capacityEconomy: '',
      capacityBusiness: '',
      capacityFirst: '',
      totalCapacity: '',
      registrationNumber: ''
    })
    setImages([])
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AircraftFormData> = {}
    
    if (!formData.model.trim()) {
      newErrors.model = "Model máy bay là bắt buộc"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    
    onSubmit({
      ...formData,
      mediaPublicIds: images
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model máy bay *</Label>
              <Input 
                id="model" 
                placeholder="Boeing 777"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({...prev, model: e.target.value}))}
                className={errors.model ? "border-red-500" : ""}
              />
              {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Nhà sản xuất</Label>
              <Input 
                id="manufacturer" 
                placeholder="Boeing"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({...prev, manufacturer: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacityEconomy">Sức chứa hạng phổ thông</Label>
              <Input 
                id="capacityEconomy" 
                type="number"
                placeholder="200"
                value={formData.capacityEconomy}
                onChange={(e) => setFormData(prev => ({...prev, capacityEconomy: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacityBusiness">Sức chứa hạng thương gia</Label>
              <Input 
                id="capacityBusiness" 
                type="number"
                placeholder="30"
                value={formData.capacityBusiness}
                onChange={(e) => setFormData(prev => ({...prev, capacityBusiness: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacityFirst">Sức chứa hạng nhất</Label>
              <Input 
                id="capacityFirst" 
                type="number"
                placeholder="10"
                value={formData.capacityFirst}
                onChange={(e) => setFormData(prev => ({...prev, capacityFirst: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCapacity">Tổng sức chứa</Label>
              <Input 
                id="totalCapacity" 
                type="number"
                placeholder="240"
                value={formData.totalCapacity}
                onChange={(e) => setFormData(prev => ({...prev, totalCapacity: e.target.value}))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="registrationNumber">Số đăng ký</Label>
              <Input 
                id="registrationNumber" 
                placeholder="VN-ABC123"
                value={formData.registrationNumber}
                onChange={(e) => setFormData(prev => ({...prev, registrationNumber: e.target.value}))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="aircraft-images">Hình ảnh máy bay</Label>
              <MediaSelector
                value={images}
                onChange={setImages}
                maxSelection={10}
                folder="flights"
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button 
              disabled={isSubmitting || !formData.model.trim()}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Đang xử lý..." : (editingAircraft ? "Lưu thay đổi" : "Thêm máy bay")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
