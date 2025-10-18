"use client"

import React, { createContext, useContext, useMemo, useState, useCallback } from "react"
import type { MapJourney } from "@/components/mapbox-map"

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
  journeys: MapJourney[]
  showJourney: (journey: MapJourney) => void
  clearJourneys: () => void
  mapStyle: string;
  setMapStyle: (style: string) => void;
}

const RecommendPanelContext = createContext<RecommendPanelContextValue | undefined>(undefined)

export function RecommendPanelProvider({ children }: { children: React.ReactNode }) {
  const [results, setResultsState] = useState<any[]>([])
  const [externalLocation, setExternalLocation] = useState<PanelLocation | null>(null)
  const [journeys, setJourneys] = useState<MapJourney[]>([])
  const [mapStyle, setMapStyle] = useState<string>('mapbox://styles/mapbox/streets-v12');

  const setResults = useCallback((next: any[]) => {
    setResultsState(Array.isArray(next) ? next : [])
  }, [])

  const clearResults = useCallback(() => {
    setResultsState([])
  }, [])

  const showLocation = useCallback((location: PanelLocation) => {
    setExternalLocation(location)
    setJourneys([]) // Clear journeys when showing a single location
  }, [])

  const acknowledgeExternalLocation = useCallback(() => {
    setExternalLocation(null)
  }, [])

  const showJourney = useCallback((journey: MapJourney) => {
    setJourneys([journey]) // For now, only show one journey at a time
    setExternalLocation(null) // Clear single location when showing a journey
  }, [])

  const clearJourneys = useCallback(() => {
    setJourneys([])
  }, [])

  const value = useMemo<RecommendPanelContextValue>(() => ({
    results,
    setResults,
    clearResults,
    showLocation,
    externalLocation,
    acknowledgeExternalLocation,
    journeys,
    showJourney,
    clearJourneys,
    mapStyle,
    setMapStyle,
  }), [results, journeys, externalLocation, mapStyle])

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
