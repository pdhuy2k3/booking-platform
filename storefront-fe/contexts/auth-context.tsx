"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthClient, UserInfo } from '@/lib/auth-client'
import { aiChatService } from '@/modules/ai'
import type { ChatConversationSummary, ChatHistoryResponse } from '@/modules/ai'

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

  const deriveConversationTitle = (history: ChatHistoryResponse, index: number): string => {
    const firstUserMessage = history.messages.find((msg) => msg.role === 'user' && msg.content?.trim())
    const fallback = `Cuộc trò chuyện ${index + 1}`
    const rawTitle = firstUserMessage?.content?.trim() || fallback
    return rawTitle.length > 50 ? `${rawTitle.slice(0, 50)}…` : rawTitle
  }

  const loadChatConversations = useCallback(async (currentUser?: UserInfo | null) => {
    const resolvedUser = currentUser ?? user
    if (!resolvedUser) {
      setChatConversations([])
      return
    }

    try {
      const conversationIds = await aiChatService.listConversations()
      if (!conversationIds || conversationIds.length === 0) {
        setChatConversations([])
        return
      }

      const limitedIds = conversationIds.slice(0, 10)
      const histories = await Promise.allSettled(
        limitedIds.map(async (conversationId, index) => {
          const history = await aiChatService.getChatHistory(conversationId)
          return {
            id: conversationId,
            title: deriveConversationTitle(history, index),
            lastUpdated: history.lastUpdated,
          } satisfies ChatConversationSummary
        })
      )

      const summaries = histories
        .flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))

      setChatConversations(summaries)
    } catch (error) {
      console.error('Failed to load chat conversations:', error)
      setChatConversations([])
    }
  }, [user])

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

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    chatConversations,
    refreshChatConversations: () => loadChatConversations(),
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
