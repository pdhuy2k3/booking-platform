"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatInterface } from "@/components/chat-interface"
import { SearchInterface } from "@/components/search-interface"
import { RecommendationPanel } from "@/components/recommendation-panel"

type MainTab = "chat" | "search"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<MainTab>("chat")

  // Handle URL parameters
  useEffect(() => {
    const tab = searchParams.get("tab") as MainTab
    if (tab && (tab === "chat" || tab === "search")) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab)
    // Update URL without refreshing the page
    const params = new URLSearchParams()
    params.set("tab", tab)
    
    if (tab === "search") {
      // When switching to search tab, default to flights if no searchTab exists
      const currentSearchTab = searchParams.get("searchTab")
      if (!currentSearchTab || (currentSearchTab !== "flights" && currentSearchTab !== "hotels")) {
        params.set("searchTab", "flights")
      } else {
        params.set("searchTab", currentSearchTab)
      }
    }
    // Don't add searchTab parameter for chat tab
    
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  const tabs = [
    { id: "chat" as const, label: "Chat", icon: MessageCircle },
    { id: "search" as const, label: "Search", icon: Search },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Main Tab Navigation */}
      <div className="flex items-center justify-center p-4 border-b border-border">
        <div className="flex bg-muted rounded-full p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex">
        {activeTab === "chat" && (
          <>
            {/* Chat Interface - Middle */}
            <div className="flex-1 h-full">
              <ChatInterface
                onSearchResults={() => {}}
                onStartBooking={() => {}}
                onChatStart={() => {}}
              />
            </div>
            
            {/* Recommendation Panel - Right */}
            <RecommendationPanel 
              onItemSelect={(item) => {
                console.log("Selected recommendation:", item)
              }}
            />
          </>
        )}
        {activeTab === "search" && (
          <div className="flex-1 h-full">
            <SearchInterface />
          </div>
        )}
      </div>
    </div>
  )
}
