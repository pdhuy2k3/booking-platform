export interface CustomerProfile {
  profileId: string;
  userId: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportIssuingCountry?: string;
  gender?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
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
