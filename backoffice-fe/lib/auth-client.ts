import { mockUserInfo } from "./mock-data"

export interface UserInfo {
  sub: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export class AuthClient {
  // TODO: Replace with real BFF endpoints
  static async getUserInfo(): Promise<UserInfo | null> {
    try {
      // TODO: Replace with real API call
      // return await apiClient.get<UserInfo>("/api/auth/userinfo")

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      return mockUserInfo
    } catch (error) {
      return null
    }
  }

  static async logout(): Promise<void> {
    try {
      // Create a form and submit it as POST request to /logout
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/logout'
      
      // Add CSRF token if available (for security)
      const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content')
      if (csrfToken) {
        const csrfInput = document.createElement('input')
        csrfInput.type = 'hidden'
        csrfInput.name = '_csrf'
        csrfInput.value = csrfToken
        form.appendChild(csrfInput)
      }
      
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error('Logout failed:', error)
      // Force redirect even if logout fails
      window.location.href = "/"
    }
  }

  static async checkAuth(): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo()
      return !!userInfo
    } catch (error) {
      return false
    }
  }

  static loginUrl(): string {
    // TODO: Replace with real BFF login endpoint
    return "/oauth2/authorization/api-client"
  }
}
