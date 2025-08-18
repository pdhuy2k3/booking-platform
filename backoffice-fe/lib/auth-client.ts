import { mockUserInfo } from "./mock-data"
import { apiClient } from '@/lib/api-client';

export interface UserInfo {
  sub: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
}

export class AuthClient {
  // TODO: Replace with real BFF endpoints
  static async getUserInfo(): Promise<UserInfo | null> {
    try {
      return await apiClient.get<UserInfo>("/api/customers/storefront/profile")
    } catch (error) {
      return null
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post("/logout")

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

    return "/oauth2/authorization/api-client"
  }
}
