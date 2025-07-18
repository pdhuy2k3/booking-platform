import { apiClient } from "./api-client"

// Customer types
export interface CustomerProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  nationality?: string
  passportNumber?: string
  passportExpiry?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  preferences: {
    language: string
    currency: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    marketing: boolean
  }
  loyaltyProgram?: {
    memberId: string
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
    points: number
    nextTierPoints: number
  }
  createdAt: string
  updatedAt: string
  isVerified: boolean
  isActive: boolean
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  nationality?: string
  passportNumber?: string
  passportExpiry?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  preferences?: {
    language?: string
    currency?: string
    notifications?: {
      email?: boolean
      sms?: boolean
      push?: boolean
    }
    marketing?: boolean
  }
}

export interface TravelDocument {
  id: string
  type: 'PASSPORT' | 'ID_CARD' | 'DRIVER_LICENSE' | 'VISA'
  documentNumber: string
  issuingCountry: string
  expiryDate: string
  isVerified: boolean
  uploadedAt: string
}

export interface SavedTraveler {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber?: string
  passportExpiry?: string
  relationship: 'SELF' | 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'FRIEND' | 'OTHER'
  isFrequentTraveler: boolean
  createdAt: string
}

export interface LoyaltyTransaction {
  id: string
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED'
  points: number
  description: string
  bookingReference?: string
  expiryDate?: string
  createdAt: string
}

export class CustomerService {
  // Profile Management
  static async getProfile(): Promise<CustomerProfile> {
    return apiClient.get<CustomerProfile>(`/customers/storefront/profile`)
  }

  static async updateProfile(updates: UpdateProfileRequest): Promise<CustomerProfile> {
    return apiClient.patch<CustomerProfile>(`/customers/storefront/profile`, updates)
  }

  static async uploadProfilePhoto(photo: File): Promise<{ photoUrl: string }> {
    const formData = new FormData()
    formData.append('photo', photo)

    return apiClient.post(`/api/customers/storefront/profile/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  static async deleteAccount(reason?: string): Promise<void> {
    return apiClient.delete(`/api/customers/storefront/profile`, {
      data: { reason }
    })
  }

  // Travel Documents
  static async getTravelDocuments(): Promise<TravelDocument[]> {
    return apiClient.get<TravelDocument[]>(`/api/customers/storefront/documents`)
  }

  static async uploadTravelDocument(
    document: {
      type: string
      documentNumber: string
      issuingCountry: string
      expiryDate: string
      file: File
    }
  ): Promise<TravelDocument> {
    const formData = new FormData()
    formData.append('type', document.type)
    formData.append('documentNumber', document.documentNumber)
    formData.append('issuingCountry', document.issuingCountry)
    formData.append('expiryDate', document.expiryDate)
    formData.append('file', document.file)

    return apiClient.post(`/api/customers/storefront/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  static async deleteTravelDocument(documentId: string): Promise<void> {
    return apiClient.delete(`/api/customers/storefront/documents/${documentId}`)
  }

  // Saved Travelers
  static async getSavedTravelers(): Promise<SavedTraveler[]> {
    return apiClient.get<SavedTraveler[]>(`/api/customers/storefront/travelers`)
  }

  static async addSavedTraveler(traveler: Omit<SavedTraveler, 'id' | 'createdAt'>): Promise<SavedTraveler> {
    return apiClient.post<SavedTraveler>(`/api/customers/storefront/travelers`, traveler)
  }

  static async updateSavedTraveler(
    travelerId: string,
    updates: Partial<Omit<SavedTraveler, 'id' | 'createdAt'>>
  ): Promise<SavedTraveler> {
    return apiClient.patch<SavedTraveler>(`/api/customers/storefront/travelers/${travelerId}`, updates)
  }

  static async deleteSavedTraveler(travelerId: string): Promise<void> {
    return apiClient.delete(`/api/customers/storefront/travelers/${travelerId}`)
  }

  // Loyalty Program
  static async getLoyaltyBalance(): Promise<{
    memberId: string
    tier: string
    currentPoints: number
    lifetimePoints: number
    nextTierPoints: number
    nextTierName: string
    expiringPoints: Array<{
      points: number
      expiryDate: string
    }>
  }> {
    return apiClient.get(`/api/customers/storefront/loyalty/balance`)
  }

  static async getLoyaltyHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    transactions: LoyaltyTransaction[]
    totalCount: number
    page: number
    limit: number
    hasMore: boolean
  }> {
    const queryParams = apiClient.buildQueryParams({ page, limit })
    return apiClient.get(`/api/customers/storefront/loyalty/history?${queryParams}`)
  }

  static async redeemPoints(redemption: {
    points: number
    type: 'DISCOUNT' | 'UPGRADE' | 'VOUCHER'
    bookingId?: string
    description: string
  }): Promise<{
    redemptionId: string
    pointsRedeemed: number
    value: number
    currency: string
    expiryDate?: string
  }> {
    return apiClient.post(`/api/customers/storefront/loyalty/redeem`, redemption)
  }

  // Preferences and Settings
  static async getNotificationPreferences(): Promise<{
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
    bookingUpdates: boolean
    promotions: boolean
    newsletter: boolean
  }> {
    return apiClient.get(`/api/customers/storefront/preferences/notifications`)
  }

  static async updateNotificationPreferences(
    preferences: {
      email?: boolean
      sms?: boolean
      push?: boolean
      marketing?: boolean
      bookingUpdates?: boolean
      promotions?: boolean
      newsletter?: boolean
    }
  ): Promise<void> {
    return apiClient.patch(`/api/customers/storefront/preferences/notifications`, preferences)
  }

  // Account Security
  static async changePassword(passwords: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> {
    return apiClient.post(`/api/customers/storefront/change-password`, passwords)
  }

  static async enable2FA(): Promise<{
    qrCode: string
    backupCodes: string[]
    secret: string
  }> {
    return apiClient.post(`/api/customers/storefront/2fa/enable`)
  }

  static async verify2FA(code: string): Promise<void> {
    return apiClient.post(`/api/customers/storefront/2fa/verify`, { code })
  }

  static async disable2FA(code: string): Promise<void> {
    return apiClient.post(`/api/customers/storefront/2fa/disable`, { code })
  }

  // Account Activity
  static async getLoginHistory(page: number = 1, limit: number = 20): Promise<{
    sessions: Array<{
      id: string
      ipAddress: string
      userAgent: string
      location: string
      loginAt: string
      isActive: boolean
    }>
    totalCount: number
    page: number
    limit: number
    hasMore: boolean
  }> {
    const queryParams = apiClient.buildQueryParams({ page, limit })
    return apiClient.get(`/api/customers/storefront/login-history?${queryParams}`)
  }

  static async terminateSession(sessionId: string): Promise<void> {
    return apiClient.delete(`/api/customers/storefront/sessions/${sessionId}`)
  }

  static async terminateAllSessions(): Promise<void> {
    return apiClient.delete(`/api/customers/storefront/sessions`)
  }
}

// Mock service for development
class MockCustomerService {
  static async getProfile(): Promise<CustomerProfile> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: "user-123",
      username: "john.doe",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+84901234567",
      dateOfBirth: "1990-01-15",
      nationality: "VN",
      preferences: {
        language: "vi",
        currency: "VND",
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        marketing: false
      },
      loyaltyProgram: {
        memberId: "LP123456",
        tier: "SILVER",
        points: 2500,
        nextTierPoints: 5000
      },
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      isVerified: true,
      isActive: true
    }
  }

  static async getSavedTravelers(): Promise<SavedTraveler[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return [
      {
        id: "traveler-1",
        firstName: "Jane",
        lastName: "Doe",
        dateOfBirth: "1992-05-20",
        nationality: "VN",
        passportNumber: "A1234567",
        passportExpiry: "2028-05-20",
        relationship: "SPOUSE",
        isFrequentTraveler: true,
        createdAt: "2023-06-01T00:00:00Z"
      }
    ]
  }
}

// Use real service now that we have populated databases
export const customerService = CustomerService

// Keep mock service available for testing if needed
export { MockCustomerService }
