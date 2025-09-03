"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MediaSelector } from "@/components/ui/media-selector"

interface AirportFormData {
  name: string
  code: string
  city: string
  country: string
  timezone?: string
}

interface AirportFormDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  formData: AirportFormData
  onFormDataChange: (data: AirportFormData) => void
  images: string[]
  onImagesChange: (images: string[]) => void
  formErrors: Partial<AirportFormData>
  submitting: boolean
  onSubmit: () => void
  submitLabel: string
}

export function AirportFormDialog({
  isOpen,
  onClose,
  title,
  description,
  formData,
  onFormDataChange,
  images,
  onImagesChange,
  formErrors,
  submitting,
  onSubmit,
  submitLabel
}: AirportFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên sân bay *</Label>
            <Input
              id="name"
              placeholder="Sân bay Quốc tế Nội Bài"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Mã IATA *</Label>
            <Input
              id="code"
              placeholder="HAN"
              maxLength={3}
              value={formData.code}
              onChange={(e) => onFormDataChange({ ...formData, code: e.target.value.toUpperCase() })}
              className={formErrors.code ? "border-red-500" : ""}
            />
            {formErrors.code && <p className="text-sm text-red-500">{formErrors.code}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Thành phố *</Label>
              <Input
                id="city"
                placeholder="Hà Nội"
                value={formData.city}
                onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
                className={formErrors.city ? "border-red-500" : ""}
              />
              {formErrors.city && <p className="text-sm text-red-500">{formErrors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Quốc gia *</Label>
              <Input
                id="country"
                placeholder="Vietnam"
                value={formData.country}
                onChange={(e) => onFormDataChange({ ...formData, country: e.target.value })}
                className={formErrors.country ? "border-red-500" : ""}
              />
              {formErrors.country && <p className="text-sm text-red-500">{formErrors.country}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Múi giờ</Label>
            <Input
              id="timezone"
              placeholder="Asia/Ho_Chi_Minh"
              value={formData.timezone || ""}
              onChange={(e) => onFormDataChange({ ...formData, timezone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Hình ảnh sân bay</Label>
            <MediaSelector
              value={images}
              onChange={onImagesChange}
              folder="airports"
              maxSelection={5}
              allowUpload={true}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "Đang xử lý..." : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
