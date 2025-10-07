"use client"

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { BookingSummaryView } from '@/components/booking-summary-view'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[95vw] lg:max-w-[1400px] w-[95vw] h-[92vh] max-h-[92vh] overflow-hidden p-0 gap-0 flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="absolute right-4 top-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Đóng</span>
          </Button>
        </div>

        <div className="overflow-y-auto h-full">
          <BookingSummaryView />
        </div>
      </DialogContent>
    </Dialog>
  )
}
