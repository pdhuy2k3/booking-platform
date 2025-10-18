"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthClient, UserInfo } from '@/lib/auth-client'
import { aiChatService } from '@/modules/ai'
import type { ChatConversationSummary } from '@/modules/ai'

interface AuthContextType {
  user: UserInfo | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  chatConversations: ChatConversationSummary[]
  refreshChatConversations: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [chatConversations, setChatConversations] = useState<ChatConversationSummary[]>([])

  const loadChatConversations = useCallback(async (currentUser?: UserInfo | null) => {
    const resolvedUser = currentUser ?? user
    if (!resolvedUser) {
      setChatConversations([])
      return
    }

    try {
      const serverConversations = await aiChatService.listConversations()
      if (!serverConversations || serverConversations.length === 0) {
        setChatConversations([])
        return
      }

      const summaries: ChatConversationSummary[] = serverConversations.slice(0, 50).map((conversation, index) => {
        const fallbackTitle = `Cuộc trò chuyện ${index + 1}`
        const normalizedTitle = conversation.title?.trim()?.length ? conversation.title.trim() : fallbackTitle
        return {
          id: conversation.id,
          title: normalizedTitle,
          createdAt: conversation.createdAt,
          lastUpdated: conversation.lastUpdated ?? conversation.createdAt ?? new Date().toISOString(),
        }
      })

      setChatConversations(summaries)
    } catch (error) {
      console.error('Failed to load chat conversations:', error)
      setChatConversations([])
    }
  }, []) // Remove user dependency to prevent infinite loop

  const refreshUser = async () => {
    try {
      const userInfo = await AuthClient.getUserInfo()
      setUser(userInfo)
      if (userInfo) {
        await loadChatConversations(userInfo)
      } else {
        setChatConversations([])
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      setUser(null)
      setChatConversations([])
    } finally {
      setIsLoading(false)
    }
  }

  const login = () => {
    window.location.href = AuthClient.loginUrl()
  }

  const logout = async () => {
    try {
      await AuthClient.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      setChatConversations([])
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const refreshChatConversations = useCallback(() => loadChatConversations(), [loadChatConversations])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    chatConversations,
    refreshChatConversations,
  }

  return (
    <AuthContext.Provider value={value}>
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
