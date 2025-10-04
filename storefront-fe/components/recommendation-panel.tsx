"use client"

import React from "react"
import { MapPin, Star, Clock, Plane, Hotel, Camera, Coffee, Mountain, Waves, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RecommendationItem {
  id: string
  type: "destination" | "activity" | "restaurant" | "hotel"
  title: string
  location: string
  rating: number
  price?: string
  image: string
  description: string
  tags: string[]
  duration?: string
}

interface RecommendationPanelProps {
  onItemSelect?: (item: RecommendationItem) => void
}

export function RecommendationPanel({ onItemSelect }: RecommendationPanelProps) {
  const mockRecommendations: RecommendationItem[] = [
    {
      id: "1",
      type: "destination",
      title: "Bà Nà Hills",
      location: "Đà Nẵng",
      rating: 4.5,
      price: "750,000 VNĐ",
      image: "/api/placeholder/300/200",
      description: "Khu du lịch nổi tiếng với cầu Vàng và phong cảnh tuyệt đẹp",
      tags: ["Cầu Vàng", "Cáp treo", "Phong cảnh"],
      duration: "Cả ngày"
    },
    {
      id: "2",
      type: "destination",
      title: "Hội An Ancient Town",
      location: "Quảng Nam",
      rating: 4.7,
      price: "Miễn phí",
      image: "/api/placeholder/300/200",
      description: "Phố cổ với kiến trúc truyền thống và đèn lồng rực rỡ",
      tags: ["Phố cổ", "Văn hóa", "Đèn lồng"],
      duration: "Nửa ngày"
    },
    {
      id: "3",
      type: "restaurant",
      title: "Mì Quảng Bà Mua",
      location: "Đà Nẵng",
      rating: 4.3,
      price: "50,000 VNĐ",
      image: "/api/placeholder/300/200",
      description: "Món mì Quảng truyền thống ngon nổi tiếng",
      tags: ["Mì Quảng", "Địa phương", "Giá rẻ"],
      duration: "1 giờ"
    },
    {
      id: "4",
      type: "hotel",
      title: "Fusion Maia Resort",
      location: "Đà Nẵng",
      rating: 4.8,
      price: "3,500,000 VNĐ/đêm",
      image: "/api/placeholder/300/200",
      description: "Resort sang trọng với spa và view biển tuyệt đẹp",
      tags: ["Luxury", "Spa", "Biển"],
      duration: "Qua đêm"
    },
    {
      id: "5",
      type: "activity",
      title: "Chùa Linh Ứng",
      location: "Đà Nẵng",
      rating: 4.4,
      price: "Miễn phí",
      image: "/api/placeholder/300/200",
      description: "Chùa Phật giáo với tượng Phật Quan Âm cao 67m",
      tags: ["Tâm linh", "Văn hóa", "View đẹp"],
      duration: "2 giờ"
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "destination":
        return <MapPin className="h-4 w-4" />
      case "restaurant":
        return <Coffee className="h-4 w-4" />
      case "hotel":
        return <Hotel className="h-4 w-4" />
      case "activity":
        return <Camera className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "destination":
        return "bg-blue-100 text-blue-700"
      case "restaurant":
        return "bg-orange-100 text-orange-700"
      case "hotel":
        return "bg-purple-100 text-purple-700"
      case "activity":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Gợi ý cho bạn
        </h2>
        <p className="text-sm text-gray-600">
          Khám phá những địa điểm thú vị tại Đà Nẵng
        </p>
      </div>

      {/* Recommendations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockRecommendations.map((item) => (
          <div 
            key={item.id} 
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onItemSelect?.(item)}
          >
            {/* Image */}
            <div className="aspect-video bg-gray-200 relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-sm">📸 {item.title}</span>
              </div>
              
              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <Badge className={`${getTypeColor(item.type)} text-xs font-medium`}>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(item.type)}
                    {item.type}
                  </div>
                </Badge>
              </div>
              
              {/* Rating */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-medium">{item.rating}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                    {item.duration && (
                      <>
                        <Clock className="h-3 w-3 ml-2" />
                        {item.duration}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {item.price}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Button */}
              <Button 
                size="sm" 
                className="w-full h-8 text-xs"
                variant="outline"
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Mountain className="h-3 w-3 mr-1" />
            Núi
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Waves className="h-3 w-3 mr-1" />
            Biển
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            Thành phố
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Coffee className="h-3 w-3 mr-1" />
            Ẩm thực
          </Button>
        </div>
      </div>
    </div>
  )
}