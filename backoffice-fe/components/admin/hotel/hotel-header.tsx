"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Hotel } from "@/types/api"

interface HotelHeaderProps {
  hotel: Hotel
  onBack: () => void
}

export function HotelHeader({ hotel, onBack }: HotelHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{hotel.name}</h1>
        <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý thông tin, loại phòng và tồn kho phòng</p>
      </div>
    </div>
  )
}
