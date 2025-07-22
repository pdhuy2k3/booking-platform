import { apiClient } from "@/common/api/api-client"
import { CustomerProfile, UpdateProfileRequest, TravelDocument, SavedTraveler, LoyaltyTransaction } from "./types"

export class CustomerService {
  // Profile Management
  static async getProfile(): Promise<CustomerProfile> {
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
    return apiClient.get<CustomerProfile>(`/api/customers/storefront/profile`)
  }

  static async updateProfile(profile: UpdateProfileRequest): Promise<CustomerProfile> {
        return apiClient.put<CustomerProfile>("/api/customers/storefront/profile", profile);
    }

    static async sendVerificationEmail(): Promise<void> {
        return apiClient.post("/api/customers/storefront/profile/send-verification-email");
    }

    static async sendUpdatePasswordEmail(): Promise<void> {
        return apiClient.post("/api/customers/storefront/profile/send-update-password-email");
    }

    static async configureTotp(): Promise<string> {
        return apiClient.post("/api/customers/storefront/profile/configure-totp");
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
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
    return apiClient.delete(`/api/customers/storefront/profile`, {
      data: { reason }
    })
  }

  // Travel Documents
  static async getTravelDocuments(): Promise<TravelDocument[]> {
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
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

    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
    return apiClient.post(`/api/customers/storefront/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  static async deleteTravelDocument(documentId: string): Promise<void> {
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
    return apiClient.delete(`/api/customers/storefront/documents/${documentId}`)
  }

  // Saved Travelers
  static async getSavedTravelers(): Promise<SavedTraveler[]> {
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
    return apiClient.get<SavedTraveler[]>(`/api/customers/storefront/travelers`)
  }

  static async addSavedTraveler(traveler: Omit<SavedTraveler, 'id' | 'createdAt'>): Promise<SavedTraveler> {
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
    return apiClient.post<SavedTraveler>(`/api/customers/storefront/travelers`, traveler)
  }

  static async updateSavedTraveler(
    travelerId: string,
    updates: Partial<Omit<SavedTraveler, 'id' | 'createdAt'>>
  ): Promise<SavedTraveler> {
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
    return apiClient.patch<SavedTraveler>(`/api/customers/storefront/travelers/${travelerId}`, updates)
  }

  static async deleteSavedTraveler(travelerId: string): Promise<void> {
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
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
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
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
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
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
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
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
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
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
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
    return apiClient.patch(`/api/customers/storefront/preferences/notifications`, preferences)
  }

  // Account Security
  static async changePassword(passwords: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> {
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
    return apiClient.post(`/api/customers/storefront/change-password`, passwords)
  }

  static async enable2FA(): Promise<{
    qrCode: string
    backupCodes: string[]
    secret: string
  }> {
    // Backend extracts userId from JWT token using AuthenticationUtils.extractUserId()
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

// Use real service now that we have populated databases
export const customerService = new CustomerService()
