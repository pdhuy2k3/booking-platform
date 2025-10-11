"use client"

import React, { createContext, useContext, useMemo, useState, useCallback } from "react"

type PanelLocation = {
  lat: number
  lng: number
  title: string
  description?: string
}

type RecommendPanelContextValue = {
  results: any[]
  setResults: (next: any[]) => void
  clearResults: () => void
  showLocation: (location: PanelLocation) => void
  externalLocation: PanelLocation | null
  acknowledgeExternalLocation: () => void
}

const RecommendPanelContext = createContext<RecommendPanelContextValue | undefined>(undefined)

export function RecommendPanelProvider({ children }: { children: React.ReactNode }) {
  const [results, setResultsState] = useState<any[]>([])
  const [externalLocation, setExternalLocation] = useState<PanelLocation | null>(null)

  const setResults = useCallback((next: any[]) => {
    setResultsState(Array.isArray(next) ? next : [])
  }, [])

  const clearResults = useCallback(() => {
    setResultsState([])
  }, [])

  const showLocation = useCallback((location: PanelLocation) => {
    setExternalLocation(location)
  }, [])

  const acknowledgeExternalLocation = useCallback(() => {
    setExternalLocation(null)
  }, [])

  const value = useMemo<RecommendPanelContextValue>(() => ({
    results,
    setResults,
    clearResults,
    showLocation,
    externalLocation,
    acknowledgeExternalLocation,
  }), [results, setResults, clearResults, showLocation, externalLocation, acknowledgeExternalLocation])

  return (
    <RecommendPanelContext.Provider value={value}>
      {children}
    </RecommendPanelContext.Provider>
  )
}

export function useRecommendPanel() {
  const context = useContext(RecommendPanelContext)
  if (!context) {
    throw new Error("useRecommendPanel must be used within a RecommendPanelProvider")
  }
  return context
}
