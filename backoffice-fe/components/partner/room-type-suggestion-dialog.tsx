"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Lightbulb, Plus, Check } from "lucide-react"
import { 
  ROOM_TYPE_SUGGESTIONS, 
  getRoomTypeSuggestionsByCategory, 
  searchRoomTypeSuggestions,
  type RoomTypeSuggestion 
} from "@/lib/room-type-suggestions"

interface RoomTypeFormData {
  name: string
  description: string
  capacity: number
  basePrice: number
  selectedAmenities: string[]
}

interface RoomTypeSuggestionDialogProps {
  onCreateRoomType: (data: RoomTypeFormData) => void
  trigger?: React.ReactNode
}

export function RoomTypeSuggestionDialog({ 
  onCreateRoomType, 
  trigger 
}: RoomTypeSuggestionDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState<RoomTypeFormData>({
    name: "",
    description: "",
    capacity: 2,
    basePrice: 0,
    selectedAmenities: []
  })

  const searchResults = searchQuery 
    ? searchRoomTypeSuggestions(searchQuery)
    : []

  const applySuggestion = (suggestion: RoomTypeSuggestion) => {
    setFormData({
      name: suggestion.name,
      description: suggestion.description,
      capacity: suggestion.defaultCapacity,
      basePrice: formData.basePrice, // Keep existing price
      selectedAmenities: suggestion.suggestedAmenities
    })
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) return
    
    onCreateRoomType(formData)
    setOpen(false)
    
    // Reset form
    setFormData({
      name: "",
      description: "",
      capacity: 2,
      basePrice: 0,
      selectedAmenities: []
    })
    setSearchQuery("")
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenity)
        ? prev.selectedAmenities.filter(a => a !== amenity)
        : [...prev.selectedAmenities, amenity]
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm loại phòng
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Tạo loại phòng mới
          </DialogTitle>
          <DialogDescription>
            Sử dụng gợi ý có sẵn hoặc tự tạo loại phòng theo ý muốn
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="suggestions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="suggestions">Gợi ý loại phòng</TabsTrigger>
              <TabsTrigger value="custom">Tự tạo</TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm loại phòng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {searchQuery ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Kết quả tìm kiếm</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {searchResults.map((suggestion, index) => (
                      <SuggestionCard 
                        key={index} 
                        suggestion={suggestion} 
                        onApply={applySuggestion}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                // Category Tabs
                <Tabs defaultValue="standard" className="space-y-3">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="standard">Tiêu chuẩn</TabsTrigger>
                    <TabsTrigger value="premium">Cao cấp</TabsTrigger>
                    <TabsTrigger value="suite">Suite</TabsTrigger>
                    <TabsTrigger value="budget">Tiết kiệm</TabsTrigger>
                  </TabsList>

                  {(['standard', 'premium', 'suite', 'budget'] as const).map(category => (
                    <TabsContent key={category} value={category}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                        {getRoomTypeSuggestionsByCategory(category).map((suggestion, index) => (
                          <SuggestionCard 
                            key={index} 
                            suggestion={suggestion} 
                            onApply={applySuggestion}
                          />
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                💡 <strong>Mẹo:</strong> Bạn có thể chọn gợi ý từ tab "Gợi ý loại phòng" rồi chỉnh sửa ở đây
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Section */}
          <div className="mt-6 space-y-4 border-t pt-4">
            <h3 className="font-medium">Thông tin loại phòng</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Tên loại phòng *</Label>
                <Input
                  id="roomName"
                  placeholder="VD: Deluxe Ocean View"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Sức chứa *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về loại phòng..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrice">Giá cơ bản (VND) *</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="10000"
                placeholder="1000000"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))}
              />
            </div>

            {formData.selectedAmenities.length > 0 && (
              <div className="space-y-2">
                <Label>Tiện nghi gợi ý</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedAmenities.map(amenity => (
                    <Badge 
                      key={amenity} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity} ×
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Nhấp vào tiện nghi để xóa. Bạn có thể chọn tiện nghi cụ thể sau khi tạo loại phòng.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.name.trim() || formData.basePrice <= 0}
          >
            Tạo loại phòng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SuggestionCard({ 
  suggestion, 
  onApply 
}: { 
  suggestion: RoomTypeSuggestion
  onApply: (suggestion: RoomTypeSuggestion) => void
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{suggestion.name}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {suggestion.defaultCapacity} người
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <CardDescription className="text-xs line-clamp-2">
          {suggestion.description}
        </CardDescription>
        
        {suggestion.suggestedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {suggestion.suggestedAmenities.slice(0, 3).map(amenity => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {suggestion.suggestedAmenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{suggestion.suggestedAmenities.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-xs"
          onClick={() => onApply(suggestion)}
        >
          <Check className="w-3 h-3 mr-1" />
          Sử dụng mẫu này
        </Button>
      </CardContent>
    </Card>
  )
}
