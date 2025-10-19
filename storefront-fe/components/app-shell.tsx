"use client"

import React, { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { RecommendPanel } from "@/components/recommend-panel"
import { useRecommendPanel } from "@/contexts/recommend-panel-context"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { results } = useRecommendPanel()

  return (
    <div className="flex h-full bg-background text-foreground">
      <Suspense
        fallback={
          <nav className="w-[72px] min-w-[72px] flex items-center justify-center border-r border-border text-xs text-muted-foreground">
            Loading…
          </nav>
        }
      >
        <Sidebar />
      </Suspense>
      <div className="flex flex-1 min-w-0 h-full">
        <div className="flex flex-1 min-w-0 h-full">
          {children}
        </div>
        <aside className="hidden md:flex h-full border-l border-border flex-col overflow-hidden shrink-0 bg-background md:w-[320px]">
          <RecommendPanel
            results={results}
            className="w-full"
          />
        </aside>
      </div>
    </div>
  )
}
