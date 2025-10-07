
import { apiClient } from '@/lib/api-client';
import { UserInfo as UserInfoType } from './validation-schemas';

export type UserInfo = UserInfoType;

export class AuthClient {

  static async getUserInfo(): Promise<UserInfo | null> {
    try {
      return await apiClient.get<UserInfo>("/customers/storefront/profile")
    } catch (error) {
      return null
    }
  }

  static async logout(): Promise<void> {
    try {

      const response = await fetch(`/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`)
      }
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

    return "/oauth2/authorization/storefront-client"
  }
}