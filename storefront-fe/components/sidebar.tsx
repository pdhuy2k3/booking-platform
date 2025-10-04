"use client"

import { useEffect, useCallback, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageCircle, Search, Info, LogOut, UserRound, User, BarChart3, History, PanelRightOpen, PanelRightClose } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ThemeToggle } from "@/components/theme-toggle"

export function Sidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    chatConversations,
    refreshChatConversations,
  } = useAuth()

  const [isExpanded, setIsExpanded] = useState(false)

  const activeTab = (searchParams.get("tab") as "chat" | "search" | null) ?? "chat"
  const activeConversationId = searchParams.get("conversationId")

  useEffect(() => {
    if (!isLoading && isAuthenticated && chatConversations.length === 0) {
      refreshChatConversations().catch((error) => {
        console.error("Unable to refresh conversations:", error)
      })
    }
  }, [isLoading, isAuthenticated, chatConversations.length, refreshChatConversations])

  const handleNavigateTab = useCallback(
    (tab: "chat" | "search", options?: { conversationId?: string }) => {
      const params = new URLSearchParams()
      params.set("tab", tab)

      if (tab === "search") {
        const currentSearchTab = searchParams.get("searchTab")
        const searchTab = currentSearchTab === "flights" || currentSearchTab === "hotels" ? currentSearchTab : "flights"
        params.set("searchTab", searchTab)
      }

      if (options?.conversationId) {
        params.set("conversationId", options.conversationId)
      }

      router.push(`/?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const navItems = [
    { label: "Chat", icon: MessageCircle, tab: "chat" as const },
    { label: "Search", icon: Search, tab: "search" as const },
  ]

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border bg-background flex h-full flex-col py-4 gap-2 transition-all duration-200",
        isExpanded ? "w-56 px-3" : "w-24 items-center"
      )}
    >
      <div className={cn("w-full", isExpanded ? "flex items-center justify-between" : "flex items-center justify-center")}
      >
        <Link
          href="/"
          aria-label="mindtrip Home"
          className={cn("flex h-10 w-10 items-center justify-center rounded-full", isExpanded ? "mb-4" : "mb-4")}
        >
          <div className="text-2xl font-bold">
            <span className="text-foreground">🧠</span>
          </div>
        </Link>
        {isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Thu gọn"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className={cn("flex flex-col gap-2", isExpanded ? "items-stretch" : "items-center")}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.tab

          return (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              onClick={() => handleNavigateTab(item.tab)}
              className={cn(
                "flex h-10 items-center rounded-full transition-all duration-200",
                isExpanded ? "px-3 justify-start gap-3" : "w-10 justify-center",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className={cn("flex-1 w-full overflow-y-auto", isExpanded ? "mt-2" : "mt-2 px-2")}
      >
        {isAuthenticated && chatConversations.length > 0 ? (
          <div className="space-y-1">
            {chatConversations.map((conversation) => {
              const isConversationActive = activeTab === "chat" && activeConversationId === conversation.id
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleNavigateTab("chat", { conversationId: conversation.id })}
                  className={cn(
                    "w-full rounded-md px-2 py-1 text-left text-xs transition-colors",
                    isConversationActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <span className="block truncate">{conversation.title}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className={cn("text-xs text-muted-foreground", isExpanded ? "px-2" : "px-0 text-center")}
          >
            {isAuthenticated ? "Không có cuộc trò chuyện" : "Đăng nhập để xem lịch sử"}
          </div>
        )}
      </div>

      <div className={cn("flex flex-col gap-2", isExpanded ? "items-stretch" : "items-center")}
      >
        {isLoading ? (
          <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
        ) : isAuthenticated && user ? (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="User menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border overflow-hidden bg-secondary hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background transition-all duration-200"
                >
                  {user.picture ? (
                    <Image src={user.picture} alt={user.fullName} width={40} height={40} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-foreground uppercase">
                      {user.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" align="end" className="w-56 p-2">
                <div className="flex items-center gap-3 p-2 border-b border-border mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border overflow-hidden bg-secondary">
                    {user.picture ? (
                      <Image src={user.picture} alt={user.fullName} width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-foreground uppercase">
                        {user.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-2 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard#profile"
                    className="flex items-center gap-3 px-2 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    href="/dashboard#bookings"
                    className="flex items-center gap-3 px-2 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
                  >
                    <History className="h-4 w-4" />
                    Lịch sử đặt chỗ
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <button
            type="button"
            onClick={login}
            aria-label="Sign in"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
          >
            <UserRound className="h-5 w-5" />
          </button>
        )}

        <div className={cn("flex", isExpanded ? "justify-start" : "justify-center")}
        >
          <ThemeToggle variant="simple" />
        </div>

        <div className={cn("flex", isExpanded ? "justify-start" : "justify-center")}
        >
          <Link href="/help" aria-label="Help" className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200">
              <Info className="h-5 w-5" />
            </div>
            <span className="sr-only">Help</span>
          </Link>
        </div>

        {!isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex h-9 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Mở rộng"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
