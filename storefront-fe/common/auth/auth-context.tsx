'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthState, AuthenticatedUser, authService } from '@/common/auth/auth-service'
import { CustomerProfile } from '@/modules/profile/types'
import { customerService } from '@/modules/profile/api'

interface AuthContextType extends AuthState {
  userProfile: CustomerProfile | null
  login: () => void
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  })
  
  const [userProfile, setUserProfile] = useState<CustomerProfile | null>(null)

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Fetch user profile when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && !userProfile) {
      fetchUserProfile()
    }
  }, [authState.isAuthenticated, authState.user, userProfile])

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const user = await authService.checkAuthStatus()
      
      if (user) {
        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
          error: null,
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        })
        setUserProfile(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication check failed',
      })
      setUserProfile(null)
    }
  }

  const fetchUserProfile = async () => {
    try {
      // Backend will extract userId from JWT token using AuthenticationUtils.getCurrentUserId()
      const profile = await customerService.getProfile()
      setUserProfile(profile)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Don't set auth error for profile fetch failures
      // User is still authenticated even if profile fetch fails
    }
  }

  const login = () => {
    authService.login()
  }

  const logout = async () => {
    try {
      await authService.logout()
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      })
      setUserProfile(null)
    } catch (error) {
      console.error('Error during logout:', error)
      // Force state reset even if logout fails
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      })
      setUserProfile(null)
    }
  }

  const refreshAuth = async () => {
    await checkAuthStatus()
  }

  const refreshProfile = async () => {
    if (authState.isAuthenticated) {
      await fetchUserProfile()
    }
  }

  const contextValue: AuthContextType = {
    ...authState,
    userProfile,
    login,
    logout,
    refreshAuth,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for checking if user is authenticated (useful for conditional rendering)
export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth()
  return { isAuthenticated, isLoading }
}

// Hook for getting user profile (useful for profile-specific components)
export function useUserProfile() {
  const { userProfile, isAuthenticated, isLoading } = useAuth()
  return { userProfile, isAuthenticated, isLoading }
}
