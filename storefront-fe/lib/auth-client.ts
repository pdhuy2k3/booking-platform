
import { apiClient } from '@/lib/api-client';
export interface UserInfo {
  sub: string
  name: string
  email: string
  roles: string[]
  permissions: string[]

}

export class AuthClient {
  static loginUrl(): string {
    return "/api/auth/signin"
  }
  
  static logoutUrl(): string {
    return "/api/auth/signout"
  }
}