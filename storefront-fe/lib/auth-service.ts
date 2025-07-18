import { apiClient } from "./api-client"

// Authentication types
export interface AuthenticatedUser {
  username: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: AuthenticatedUser | null
  isLoading: boolean
  error: string | null
}

export class AuthService {
  /**
   * Check if user is authenticated by calling storefront-bff
   */
  static async checkAuthStatus(): Promise<AuthenticatedUser | null> {
    try {
      const response = await fetch('/authentication/user', {
        method: 'GET',
        credentials: 'include', // Include cookies for session
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const user = await response.json()
        return user
      } else if (response.status === 401 || response.status === 403) {
        // Not authenticated
        return null
      } else {
        throw new Error(`Authentication check failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      return null
    }
  }

  /**
   * Redirect to login page
   */
  static login(): void {
    window.location.href = '/oauth2/authorization/storefront-client'
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Redirect to home page after logout
        window.location.href = '/'
      } else {
        throw new Error(`Logout failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Error during logout:', error)
      // Force redirect even if logout request fails
      window.location.href = '/'
    }
  }
}

// Mock service for development
class MockAuthService {
  private static mockUser: AuthenticatedUser | null = null
  private static isLoggedIn = false

  static async checkAuthStatus(): Promise<AuthenticatedUser | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (this.isLoggedIn && this.mockUser) {
      return this.mockUser
    }
    return null
  }

  static login(): void {
    this.mockUser = { username: 'john.doe' }
    this.isLoggedIn = true
    // Simulate redirect
    console.log('Mock login successful')
  }

  static async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    this.mockUser = null
    this.isLoggedIn = false
    console.log('Mock logout successful')
  }

  // Helper method for testing
  static setMockAuthState(authenticated: boolean, user?: AuthenticatedUser): void {
    this.isLoggedIn = authenticated
    this.mockUser = user || null
  }
}

// Use real service for production
export const authService = AuthService

// Keep mock service available for testing
export { MockAuthService }
