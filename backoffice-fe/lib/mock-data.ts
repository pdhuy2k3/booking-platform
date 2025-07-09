import type { Flight, Hotel, Booking, Customer } from "@/types/api"

// Mock data for development
export const mockFlights: Flight[] = [
  {
    id: "VN001",
    flightNumber: "VN001",
    airline: "Vietnam Airlines",
    departure: {
      airport: "HAN",
      city: "Hà Nội",
      time: "08:00",
      date: "2024-01-15",
    },
    arrival: {
      airport: "SGN",
      city: "TP.HCM",
      time: "10:15",
      date: "2024-01-15",
    },
    price: 2500000,
    currency: "VND",
    totalSeats: 180,
    availableSeats: 45,
    status: "ACTIVE",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "VJ002",
    flightNumber: "VJ002",
    airline: "VietJet Air",
    departure: {
      airport: "SGN",
      city: "TP.HCM",
      time: "14:30",
      date: "2024-01-15",
    },
    arrival: {
      airport: "HAN",
      city: "Hà Nội",
      time: "16:45",
      date: "2024-01-15",
    },
    price: 1800000,
    currency: "VND",
    totalSeats: 180,
    availableSeats: 67,
    status: "ACTIVE",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "QH003",
    flightNumber: "QH003",
    airline: "Bamboo Airways",
    departure: {
      airport: "HAN",
      city: "Hà Nội",
      time: "19:00",
      date: "2024-01-16",
    },
    arrival: {
      airport: "DAD",
      city: "Đà Nẵng",
      time: "20:30",
      date: "2024-01-16",
    },
    price: 2200000,
    currency: "VND",
    totalSeats: 164,
    availableSeats: 23,
    status: "ACTIVE",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "VN004",
    flightNumber: "VN004",
    airline: "Vietnam Airlines",
    departure: {
      airport: "SGN",
      city: "TP.HCM",
      time: "11:30",
      date: "2024-01-17",
    },
    arrival: {
      airport: "PQC",
      city: "Phú Quốc",
      time: "12:45",
      date: "2024-01-17",
    },
    price: 3000000,
    currency: "VND",
    totalSeats: 180,
    availableSeats: 0,
    status: "ACTIVE",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

export const mockHotels: Hotel[] = [
  {
    id: "HOTEL001",
    name: "Lotte Hotel Hanoi",
    description: "Khách sạn 5 sao sang trọng tại trung tâm Hà Nội",
    address: "54 Liễu Giai, Ba Đình",
    city: "Hà Nội",
    country: "Việt Nam",
    rating: 4.8,
    amenities: ["Wifi miễn phí", "Bể bơi", "Spa", "Nhà hàng", "Gym", "Bar"],
    rooms: [
      {
        id: "ROOM001",
        type: "Deluxe Room",
        price: 3500000,
        currency: "VND",
        capacity: 2,
        amenities: ["Wifi", "TV", "Minibar", "Điều hòa"],
        available: true,
      },
      {
        id: "ROOM002",
        type: "Executive Suite",
        price: 5500000,
        currency: "VND",
        capacity: 4,
        amenities: ["Wifi", "TV", "Minibar", "Điều hòa", "Phòng khách riêng"],
        available: true,
      },
    ],
    images: ["/placeholder.svg?height=300&width=400"],
    status: "ACTIVE",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "HOTEL002",
    name: "InterContinental Hanoi Westlake",
    description: "Resort sang trọng bên hồ Tây thơ mộng",
    address: "1A Nghi Tam, Tây Hồ",
    city: "Hà Nội",
    country: "Việt Nam",
    rating: 4.7,
    amenities: ["Wifi miễn phí", "Bể bơi", "Gym", "Spa", "Nhà hàng"],
    rooms: [
      {
        id: "ROOM003",
        type: "Lake View Room",
        price: 4200000,
        currency: "VND",
        capacity: 2,
        amenities: ["Wifi", "TV", "Minibar", "View hồ"],
        available: true,
      },
    ],
    images: ["/placeholder.svg?height=300&width=400"],
    status: "ACTIVE",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

export const mockBookings: Booking[] = [
  {
    id: "BK001",
    customerId: "CUS001",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@email.com",
    type: "FLIGHT",
    flightId: "VN001",
    totalAmount: 2500000,
    currency: "VND",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "BK002",
    customerId: "CUS002",
    customerName: "Trần Thị B",
    customerEmail: "tranthib@email.com",
    type: "HOTEL",
    hotelId: "HOTEL001",
    roomId: "ROOM001",
    checkIn: "2024-01-20",
    checkOut: "2024-01-22",
    totalAmount: 7000000,
    currency: "VND",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "BK003",
    customerId: "CUS003",
    customerName: "Lê Văn C",
    customerEmail: "levanc@email.com",
    type: "FLIGHT",
    flightId: "VJ002",
    totalAmount: 1800000,
    currency: "VND",
    status: "PENDING",
    paymentStatus: "PENDING",
    createdAt: "2024-01-14T00:00:00Z",
    updatedAt: "2024-01-14T00:00:00Z",
  },
  {
    id: "BK004",
    customerId: "CUS004",
    customerName: "Phạm Thị D",
    customerEmail: "phamthid@email.com",
    type: "COMBO",
    flightId: "VN001",
    hotelId: "HOTEL002",
    roomId: "ROOM003",
    checkIn: "2024-01-28",
    checkOut: "2024-01-30",
    totalAmount: 8500000,
    currency: "VND",
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
    createdAt: "2024-01-13T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

export const mockCustomers: Customer[] = [
  {
    id: "CUS001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    dateOfBirth: "1990-05-15",
    nationality: "Việt Nam",
    tier: "GOLD",
    totalBookings: 12,
    totalSpent: 45300000,
    status: "ACTIVE",
    createdAt: "2023-06-15T00:00:00Z",
    lastLoginAt: "2024-01-15T08:30:00Z",
  },
  {
    id: "CUS002",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0912345678",
    dateOfBirth: "1985-08-22",
    nationality: "Việt Nam",
    tier: "SILVER",
    totalBookings: 8,
    totalSpent: 28500000,
    status: "ACTIVE",
    createdAt: "2023-08-22T00:00:00Z",
    lastLoginAt: "2024-01-14T15:20:00Z",
  },
  {
    id: "CUS003",
    name: "Lê Văn C",
    email: "levanc@email.com",
    phone: "0923456789",
    dateOfBirth: "1992-12-10",
    nationality: "Việt Nam",
    tier: "BRONZE",
    totalBookings: 3,
    totalSpent: 8200000,
    status: "ACTIVE",
    createdAt: "2023-12-10T00:00:00Z",
    lastLoginAt: "2024-01-13T10:45:00Z",
  },
  {
    id: "CUS004",
    name: "Phạm Thị D",
    email: "phamthid@email.com",
    phone: "0934567890",
    dateOfBirth: "1988-05-03",
    nationality: "Việt Nam",
    tier: "PLATINUM",
    totalBookings: 25,
    totalSpent: 125800000,
    status: "ACTIVE",
    createdAt: "2023-05-03T00:00:00Z",
    lastLoginAt: "2024-01-12T14:15:00Z",
  },
  {
    id: "CUS005",
    name: "Hoàng Văn E",
    email: "hoangvane@email.com",
    phone: "0945678901",
    dateOfBirth: "1995-01-15",
    nationality: "Việt Nam",
    tier: "BRONZE",
    totalBookings: 1,
    totalSpent: 2500000,
    status: "INACTIVE",
    createdAt: "2024-01-15T00:00:00Z",
    lastLoginAt: "2024-01-15T09:00:00Z",
  },
]

// Mock user info for different partner types
export const mockUserInfo = {
  sub: "admin-001",
  name: "Admin User",
  email: "admin@bookingsmart.vn",
  roles: ["admin", "manager"],
  permissions: ["read:flights", "write:flights", "read:hotels", "write:hotels", "read:bookings", "write:bookings"],
}

// Hotel Partner
export const mockHotelPartnerUserInfo = {
  sub: "partner-hotel-001",
  name: "Hotel Partner",
  email: "partner@lotte.com",
  roles: ["partner"],
  partnerType: "HOTEL" as const,
  partnerServices: ["hotels"],
  permissions: ["read:own-hotels", "write:own-hotels", "read:own-bookings", "view:reports"],
}

// Flight Partner
export const mockFlightPartnerUserInfo = {
  sub: "partner-flight-001",
  name: "Vietnam Airlines Partner",
  email: "partner@vietnamairlines.com",
  roles: ["partner"],
  partnerType: "FLIGHT" as const,
  partnerServices: ["flights"],
  permissions: ["read:own-flights", "write:own-flights", "read:own-bookings", "view:reports"],
}

// Multi-service Partner
export const mockMultiPartnerUserInfo = {
  sub: "partner-multi-001",
  name: "Multi Service Partner",
  email: "partner@multiservice.com",
  roles: ["partner"],
  partnerType: "ALL" as const,
  partnerServices: ["hotels", "flights", "transport"],
  permissions: [
    "read:own-hotels",
    "write:own-hotels",
    "read:own-flights",
    "write:own-flights",
    "read:own-bookings",
    "view:reports",
    "manage:payments",
  ],
}

// Utility functions for mock data
export function filterFlights(params: {
  search?: string
  status?: string
  page?: number
  size?: number
}) {
  let filtered = [...mockFlights]

  if (params.search) {
    const search = params.search.toLowerCase()
    filtered = filtered.filter(
      (flight) =>
        flight.flightNumber.toLowerCase().includes(search) ||
        flight.airline.toLowerCase().includes(search) ||
        flight.departure.city.toLowerCase().includes(search) ||
        flight.arrival.city.toLowerCase().includes(search),
    )
  }

  if (params.status) {
    filtered = filtered.filter((flight) => flight.status === params.status)
  }

  const page = params.page || 1
  const size = params.size || 20
  const start = (page - 1) * size
  const end = start + size

  return {
    content: filtered.slice(start, end),
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    size,
    number: page,
    first: page === 1,
    last: page >= Math.ceil(filtered.length / size),
  }
}

export function filterHotels(params: {
  search?: string
  city?: string
  status?: string
  page?: number
  size?: number
}) {
  let filtered = [...mockHotels]

  if (params.search) {
    const search = params.search.toLowerCase()
    filtered = filtered.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(search) ||
        hotel.address.toLowerCase().includes(search) ||
        hotel.id.toLowerCase().includes(search),
    )
  }

  if (params.city) {
    filtered = filtered.filter((hotel) => hotel.city === params.city)
  }

  if (params.status) {
    filtered = filtered.filter((hotel) => hotel.status === params.status)
  }

  const page = params.page || 1
  const size = params.size || 20
  const start = (page - 1) * size
  const end = start + size

  return {
    content: filtered.slice(start, end),
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    size,
    number: page,
    first: page === 1,
    last: page >= Math.ceil(filtered.length / size),
  }
}

export function filterCustomers(params: {
  search?: string
  tier?: string
  status?: string
  page?: number
  size?: number
}) {
  let filtered = [...mockCustomers]

  if (params.search) {
    const search = params.search.toLowerCase()
    filtered = filtered.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.id.toLowerCase().includes(search),
    )
  }

  if (params.tier) {
    filtered = filtered.filter((customer) => customer.tier === params.tier)
  }

  if (params.status) {
    filtered = filtered.filter((customer) => customer.status === params.status)
  }

  const page = params.page || 1
  const size = params.size || 20
  const start = (page - 1) * size
  const end = start + size

  return {
    content: filtered.slice(start, end),
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    size,
    number: page,
    first: page === 1,
    last: page >= Math.ceil(filtered.length / size),
  }
}

export function filterBookings(params: {
  search?: string
  status?: string
  type?: string
  page?: number
  size?: number
}) {
  let filtered = [...mockBookings]

  if (params.search) {
    const search = params.search.toLowerCase()
    filtered = filtered.filter(
      (booking) =>
        booking.id.toLowerCase().includes(search) ||
        booking.customerName.toLowerCase().includes(search) ||
        booking.customerEmail.toLowerCase().includes(search),
    )
  }

  if (params.status) {
    filtered = filtered.filter((booking) => booking.status === params.status)
  }

  if (params.type) {
    filtered = filtered.filter((booking) => booking.type === params.type)
  }

  const page = params.page || 1
  const size = params.size || 20
  const start = (page - 1) * size
  const end = start + size

  return {
    content: filtered.slice(start, end),
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    size,
    number: page,
    first: page === 1,
    last: page >= Math.ceil(filtered.length / size),
  }
}
