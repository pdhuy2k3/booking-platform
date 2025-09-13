"use client"

import { ReactNode } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormField {
  name: string
  label: string
  type?: 'text' | 'number' | 'email' | 'password'
  placeholder?: string
  required?: boolean
  maxLength?: number
  error?: string
  value: string | number
  onChange: (value: string) => void
  className?: string
}

interface CustomField {
  name: string
  label: string
  component: ReactNode
  error?: string
}

interface AdminFormDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  fields?: FormField[]
  customFields?: CustomField[]
  onSubmit: () => void
  submitLabel: string
  isSubmitting?: boolean
  canSubmit?: boolean
}

export function AdminFormDialog({
  isOpen,
  onClose,
  title,
  description,
  fields = [],
  customFields = [],
  onSubmit,
  submitLabel,
  isSubmitting = false,
  canSubmit = true
}: AdminFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Regular form fields */}
          {fields.map((field) => (
            <div key={field.name} className={`space-y-2 ${field.className || ''}`}>
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id={field.name}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className={field.error ? "border-red-500" : ""}
              />
              {field.error && (
                <p className="text-sm text-red-500">{field.error}</p>
              )}
            </div>
          ))}

          {/* Custom fields */}
          {customFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label>
                {field.label}
              </Label>
              {field.component}
              {field.error && (
                <p className="text-sm text-red-500">{field.error}</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button 
              onClick={onSubmit} 
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? "Đang xử lý..." : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
