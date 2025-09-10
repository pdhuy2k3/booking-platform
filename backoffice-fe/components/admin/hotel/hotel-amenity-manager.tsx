"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Save, X, Check, Wifi, Car, Dumbbell, Coffee, Users, Briefcase } from "lucide-react"
import type { Amenity } from "@/types/api"
import { toast } from "sonner"

interface HotelAmenityManagerProps {
  hotelId: number
  hotelAmenities: Amenity[]
  allAmenities: Amenity[]
  onUpdate: (amenityIds: number[]) => Promise<void>
}

const amenityIcons: { [key: string]: any } = {
  wifi: Wifi,
  parking: Car,
  gym: Dumbbell,
  restaurant: Coffee,
  meeting: Users,
  business: Briefcase,
}

export function HotelAmenityManager({ 
  hotelId, 
  hotelAmenities, 
  allAmenities,
  onUpdate 
}: HotelAmenityManagerProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const initialIds = hotelAmenities?.map(a => a.id) || []
    setSelectedAmenities(initialIds)
  }, [hotelAmenities])

  const handleToggleAmenity = (amenityId: number) => {
    setSelectedAmenities(prev => {
      const newSelection = prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
      
      setHasChanges(true)
      return newSelection
    })
  }

  const handleSaveChanges = async () => {
    try {
      setLoading(true)
      await onUpdate(selectedAmenities)
      toast.success("Tiện nghi khách sạn đã được cập nhật")
      setHasChanges(false)
    } catch (error) {
      console.error("Failed to update hotel amenities:", error)
      toast.error("Không thể cập nhật tiện nghi")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    const initialIds = hotelAmenities?.map(a => a.id) || []
    setSelectedAmenities(initialIds)
    setHasChanges(false)
  }

  const filteredAmenities = allAmenities.filter(amenity => {
    const matchesSearch = amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Since categories don't exist in backend, we'll just use "all" for now
  const categories = ["all"]

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      all: "Tất cả",
      basic: "Cơ bản",
      room: "Phòng",
      business: "Doanh nghiệp",
      recreation: "Giải trí",
      dining: "Ẩm thực",
      other: "Khác"
    }
    return labels[category] || category
  }

  const getAmenityIcon = (amenity: Amenity) => {
    // Use amenity name to determine icon since we don't have icon field
    const iconKey = amenity.name.toLowerCase()
    const Icon = amenityIcons[iconKey] || Check
    return <Icon className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quản lý tiện nghi khách sạn</CardTitle>
            <CardDescription>Chọn các tiện nghi có sẵn tại khách sạn</CardDescription>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Hủy thay đổi
              </Button>
              <Button 
                size="sm"
                onClick={handleSaveChanges}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm tiện nghi..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedAmenities.length} đã chọn
              </Badge>
              <Badge variant="outline">
                {allAmenities?.length || 0} tổng cộng
              </Badge>
            </div>
          </div>

          {/* Since we don't have categories in backend, we'll simplify this */}
          <div>

            <div className="mt-4">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAmenities?.map(amenity => (
                    <div
                      key={amenity.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                        selectedAmenities.includes(amenity.id)
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        id={`hotel-amenity-${amenity.id}`}
                        checked={selectedAmenities.includes(amenity.id)}
                        onCheckedChange={() => handleToggleAmenity(amenity.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={`hotel-amenity-${amenity.id}`}
                          className="flex items-center gap-2 font-medium cursor-pointer"
                        >
                          {getAmenityIcon(amenity)}
                          {amenity.name}
                        </Label>
                        {!amenity.isActive && (
                          <Badge variant="secondary" className="text-xs">Không hoạt động</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {(!filteredAmenities || filteredAmenities.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy tiện nghi nào
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAmenities(allAmenities?.filter(a => a.isActive).map(a => a.id) || [])
                setHasChanges(true)
              }}
            >
              Chọn tất cả
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAmenities([])
                setHasChanges(true)
              }}
            >
              Bỏ chọn tất cả
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Select first 5 active amenities as "basic"
                const basicAmenities = allAmenities
                  ?.filter(a => a.isActive)
                  ?.slice(0, 5)
                  ?.map(a => a.id) || []
                setSelectedAmenities(basicAmenities)
                setHasChanges(true)
              }}
            >
              Chọn cơ bản
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
