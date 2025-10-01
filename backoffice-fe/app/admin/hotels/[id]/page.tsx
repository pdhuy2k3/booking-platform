"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { HotelService } from "@/services/hotel-service"
import { AmenityService } from "@/services/amenity-service"
import { RoomTypeService } from "@/services/room-type-service"
import { HotelAmenityManager } from "@/components/admin/hotel/hotel-amenity-manager"
import { RoomTypeManager } from "@/components/admin/hotel/room-type-manager"
import { MediaSelector } from "@/components/ui/media-selector"
import { HotelHeader } from "@/components/admin/hotel/hotel-header"
import { HotelOverview } from "@/components/admin/hotel/hotel-overview"
import type { Hotel, Amenity, RoomType, MediaResponse } from "@/types/api"
import { toast } from "sonner"

export default function HotelDetails() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id

  const hotelId = useMemo(() => {
    if (!id || Array.isArray(id)) return null
    const numId = Number(id)
    return Number.isNaN(numId) ? null : numId
  }, [id])

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [hotelImages, setHotelImages] = useState<MediaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (hotelId) {
      void loadHotelDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId])

  const loadHotelDetails = async () => {
    if (!hotelId) return

    try {
      setLoading(true)

      const [hotelData, amenityData, roomTypeData] = await Promise.all([
        HotelService.getHotel(hotelId),
        AmenityService.getActiveAmenities(),
        RoomTypeService.getRoomTypesByHotel(hotelId)
      ])

      setHotel(hotelData)
      setAmenities(amenityData || [])
      setRoomTypes(roomTypeData || [])

      if (hotelData?.media) {
        setHotelImages(hotelData.media)
      }
    } catch (error) {
      console.error("Failed to load hotel details:", error)
      toast.error("Không thể tải thông tin khách sạn")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateHotelAmenities = async (amenityIds: number[]) => {
    if (!hotelId) return

    try {
      await HotelService.updateHotelAmenities(hotelId, amenityIds)
      await loadHotelDetails()
    } catch (error) {
      console.error("Failed to update hotel amenities:", error)
      throw error
    }
  }

  const handleUpdateHotelImages = async (media: MediaResponse[]) => {
    if (!hotelId) return

    try {
      await HotelService.updateHotel(hotelId, { media })
      setHotelImages(media)
      toast.success("Hình ảnh khách sạn đã được cập nhật")
      await loadHotelDetails()
    } catch (error) {
      console.error("Failed to update hotel images:", error)
      toast.error("Không thể cập nhật hình ảnh khách sạn")
      throw error
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-2">Đang tải...</span>
        </div>
      </AdminLayout>
    )
  }

  if (!hotel) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Không tìm thấy khách sạn</h2>
            <Button onClick={() => router.push("/admin/hotels")} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <HotelHeader
        hotel={hotel}
        onBack={() => router.push("/admin/hotels")}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="room-types">Loại phòng</TabsTrigger>
          <TabsTrigger value="amenities">Tiện nghi</TabsTrigger>
          <TabsTrigger value="media">Hình ảnh</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <HotelOverview hotel={hotel} formatPrice={formatPrice} />
        </TabsContent>

        <TabsContent value="room-types">
          {hotelId && (
            <RoomTypeManager
              hotelId={hotelId}
              onRoomTypesChange={loadHotelDetails}
            />
          )}
        </TabsContent>

        <TabsContent value="amenities">
          {hotelId && (
            <HotelAmenityManager
              hotelId={hotelId}
              hotelAmenities={hotel.amenities || []}
              allAmenities={amenities}
              onUpdate={handleUpdateHotelAmenities}
            />
          )}
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quản lý hình ảnh khách sạn</CardTitle>
              <CardDescription>Chọn hình ảnh hiển thị cho khách sạn</CardDescription>
            </CardHeader>
            <CardContent>
              <MediaSelector
                folder="hotels"
                value={hotelImages}
                onMediaChange={handleUpdateHotelImages}
                maxSelection={10}
                allowUpload
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
