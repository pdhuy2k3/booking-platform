// Room type suggestions to help partners create room types faster
// This is frontend-only data, not stored in database

export interface RoomTypeSuggestion {
  name: string
  description: string
  defaultCapacity: number
  suggestedAmenities: string[]
  category: 'standard' | 'suite' | 'premium' | 'budget'
}

export const ROOM_TYPE_SUGGESTIONS: RoomTypeSuggestion[] = [
  // Standard Rooms
  {
    name: 'Standard Room',
    description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản',
    defaultCapacity: 2,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
    category: 'standard'
  },
  {
    name: 'Superior Room',
    description: 'Phòng cao cấp với không gian rộng rãi và view đẹp',
    defaultCapacity: 2,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
    category: 'standard'
  },
  {
    name: 'Deluxe Room',
    description: 'Phòng deluxe sang trọng với thiết kế hiện đại',
    defaultCapacity: 2,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'City View'],
    category: 'premium'
  },

  // Suites
  {
    name: 'Junior Suite',
    description: 'Suite nhỏ với khu vực nghỉ ngơi riêng biệt',
    defaultCapacity: 3,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Area', 'Mini Bar'],
    category: 'suite'
  },
  {
    name: 'Executive Suite',
    description: 'Suite cao cấp dành cho khách doanh nhân',
    defaultCapacity: 3,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Work Desk', 'Executive Lounge Access'],
    category: 'suite'
  },
  {
    name: 'Presidential Suite',
    description: 'Suite tổng thống với dịch vụ VIP',
    defaultCapacity: 4,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Butler Service', 'Panoramic View'],
    category: 'suite'
  },

  // Special Views
  {
    name: 'Ocean View Room',
    description: 'Phòng với view nhìn ra biển tuyệt đẹp',
    defaultCapacity: 2,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Ocean View', 'Balcony'],
    category: 'premium'
  },
  {
    name: 'Garden View Room',
    description: 'Phòng nhìn ra khu vườn xanh mát',
    defaultCapacity: 2,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Garden View', 'Terrace'],
    category: 'standard'
  },
  {
    name: 'Pool View Room',
    description: 'Phòng với view nhìn ra hồ bơi',
    defaultCapacity: 2,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Pool View', 'Pool Access'],
    category: 'standard'
  },

  // Budget Options
  {
    name: 'Economy Room',
    description: 'Phòng tiết kiệm với tiện nghi cơ bản',
    defaultCapacity: 1,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Shared Bathroom'],
    category: 'budget'
  },
  {
    name: 'Twin Room',
    description: 'Phòng đôi với 2 giường đơn',
    defaultCapacity: 2,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Twin Beds'],
    category: 'standard'
  },

  // Family Rooms
  {
    name: 'Family Room',
    description: 'Phòng gia đình rộng rãi cho 4-6 người',
    defaultCapacity: 4,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Extra Beds', 'Family Amenities'],
    category: 'standard'
  },
  {
    name: 'Connecting Rooms',
    description: 'Hai phòng liền kề có cửa nối',
    defaultCapacity: 4,
    suggestedAmenities: ['WiFi', 'TV', 'Air Conditioning', 'Connecting Door'],
    category: 'standard'
  }
]

export const getRoomTypeSuggestionsByCategory = (category: RoomTypeSuggestion['category']) => {
  return ROOM_TYPE_SUGGESTIONS.filter(suggestion => suggestion.category === category)
}

export const searchRoomTypeSuggestions = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return ROOM_TYPE_SUGGESTIONS.filter(
    suggestion => 
      suggestion.name.toLowerCase().includes(lowercaseQuery) ||
      suggestion.description.toLowerCase().includes(lowercaseQuery)
  )
}
