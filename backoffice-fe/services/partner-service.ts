import { apiClient } from "@/lib/api-client"
import type { PaginatedResponse } from "@/types/api"

export interface PartnerAdminVm {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  createdTimestamp: string
  enabled: boolean
  
  // Partner-specific attributes
  partnerType: 'HOTEL' | 'TRANSPORT' | 'ACTIVITY' | null
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended' | null
  onboardingStatus: 'incomplete' | 'pending_review' | 'approved' | 'active' | null
  businessName: string | null
  contactPersonName: string | null
  phoneNumber: string | null
  businessAddress: string | null
  businessRegistrationNumber: string | null
  taxId: string | null
  
  // Additional metadata
  lastLogin: string | null
  totalProperties: number
  accountManager: string | null
  applicationDate: string | null
  approvedDate: string | null
  rejectedDate: string | null
  approvalNotes: string | null
  rejectionReason: string | null
}

export interface PartnerApplicationVm {
  businessName: string
  contactPersonName: string
  email: string
  phoneNumber: string
  businessAddress: string
  city: string
  country: string
  partnerType: 'HOTEL' | 'TRANSPORT' | 'ACTIVITY'
  businessRegistrationNumber?: string
  taxId?: string
  website?: string
  description?: string
  
  // Hotel-specific fields
  starRating?: number
  totalRooms?: number
  hotelChain?: string
  
  // Transport-specific fields
  vehicleTypes?: string
  serviceAreas?: string
  
  // Activity-specific fields
  activityTypes?: string
  operatingSchedule?: string
}

export interface PartnerApprovalRequest {
  adminUserId: string
  notes?: string
}

export interface PartnerRejectionRequest {
  adminUserId: string
  reason: string
}

export class PartnerService {
  private static readonly BASE_PATH = "/api/customers/backoffice/admin/partners"

  /**
   * Get all partners with filtering
   */
  static async getPartners(params?: {
    page?: number
    size?: number
    search?: string
    status?: string
    partnerType?: string
  }): Promise<PaginatedResponse<PartnerAdminVm>> {
    const queryParams = new URLSearchParams()
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.size !== undefined) queryParams.append('size', params.size.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.partnerType) queryParams.append('partnerType', params.partnerType)
    
    const queryString = queryParams.toString()
    const url = `${this.BASE_PATH}${queryString ? `?${queryString}` : ''}`
    
    return await apiClient.get<PaginatedResponse<PartnerAdminVm>>(url)
  }

  /**
   * Get pending partner applications
   */
  static async getPendingApplications(): Promise<PartnerAdminVm[]> {
    return await apiClient.get<PartnerAdminVm[]>(`${this.BASE_PATH}/pending`)
  }

  /**
   * Get partners by status
   */
  static async getPartnersByStatus(status: string): Promise<PartnerAdminVm[]> {
    return await apiClient.get<PartnerAdminVm[]>(`${this.BASE_PATH}/status/${status}`)
  }

  /**
   * Get partner by ID
   */
  static async getPartner(id: string): Promise<PartnerAdminVm> {
    return await apiClient.get<PartnerAdminVm>(`${this.BASE_PATH}/${id}`)
  }

  /**
   * Approve partner application
   */
  static async approvePartner(partnerId: string, request: PartnerApprovalRequest): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/${partnerId}/approve`, request)
  }

  /**
   * Reject partner application
   */
  static async rejectPartner(partnerId: string, request: PartnerRejectionRequest): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/${partnerId}/reject`, request)
  }

  /**
   * Update partner onboarding status
   */
  static async updateOnboardingStatus(partnerId: string, status: string): Promise<void> {
    await apiClient.patch(`${this.BASE_PATH}/${partnerId}/onboarding-status`, { status })
  }

  /**
   * Suspend partner
   */
  static async suspendPartner(partnerId: string, reason: string): Promise<void> {
    await apiClient.patch(`${this.BASE_PATH}/${partnerId}/suspend`, { reason })
  }

  /**
   * Reactivate partner
   */
  static async reactivatePartner(partnerId: string): Promise<void> {
    await apiClient.patch(`${this.BASE_PATH}/${partnerId}/reactivate`, {})
  }

  /**
   * Assign account manager to partner
   */
  static async assignAccountManager(partnerId: string, adminUserId: string): Promise<void> {
    await apiClient.patch(`${this.BASE_PATH}/${partnerId}/assign-manager`, { adminUserId })
  }

  /**
   * Submit partner application (public endpoint)
   */
  static async submitApplication(application: PartnerApplicationVm): Promise<{ partnerId: string }> {
    return await apiClient.post<{ partnerId: string }>(`/api/customers/public/partner-application`, application)
  }

  /**
   * Get partner statistics for dashboard
   */
  static async getPartnerStats(): Promise<{
    totalPartners: number
    pendingApplications: number
    activePartners: number
    partnersByType: { [key: string]: number }
    recentApplications: PartnerAdminVm[]
  }> {
    return await apiClient.get(`${this.BASE_PATH}/stats`)
  }
}
