"use client"

import { useState, useEffect } from "react"
import { AuthClient, type UserInfo } from "@/lib/auth-client"

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const userInfo = await AuthClient.getUserInfo()
      setUser(userInfo)
      setError(null)
    } catch (err) {
      setError("Authentication failed")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AuthClient.logout()
      setUser(null)
    } catch (err) {
      setError("Logout failed")
    }
  }

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false
  }
  const login= () => {
    window.location.href = AuthClient.loginUrl()
  }
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    checkAuth,
    hasRole,
    hasPermission,
    login
  }
}
