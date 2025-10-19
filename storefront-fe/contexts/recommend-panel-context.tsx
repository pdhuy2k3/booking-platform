"use client"

import React, { createContext, useContext, useMemo, useState, useCallback } from "react"
import type { MapJourney, MapLocation } from "@/components/mapbox-map"

type PanelLocation = {
  id?: string
  lat: number
  lng: number
  title: string
  description?: string
  type?: MapLocation["type"]
  price?: string
  image?: string
  focus?: boolean
}

type InternalPanelLocation = Required<Pick<PanelLocation, "id">> & PanelLocation & { focus: boolean }

type ShowLocationOptions = {
  append?: boolean
  preserveJourneys?: boolean
}

type RecommendPanelContextValue = {
  results: any[]
  setResults: (next: any[]) => void
  clearResults: () => void
  showLocation: (location: PanelLocation, options?: ShowLocationOptions) => void
  showLocations: (locations: PanelLocation[], options?: ShowLocationOptions) => void
  clearLocations: () => void
  externalLocations: PanelLocation[]
  acknowledgeExternalLocation: () => void
  journeys: MapJourney[]
  showJourney: (journey: MapJourney) => void
  clearJourneys: () => void
  mapStyle: string;
  setMapStyle: (style: string) => void;
}

const RecommendPanelContext = createContext<RecommendPanelContextValue | undefined>(undefined)

const generateLocationId = () => `panel-location-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`

const toInternalLocation = (location: PanelLocation, focus = true): InternalPanelLocation => ({
  ...location,
  id: location.id ?? generateLocationId(),
  focus,
})

export function RecommendPanelProvider({ children }: { children: React.ReactNode }) {
  const [results, setResultsState] = useState<any[]>([])
  const [externalLocationsState, setExternalLocationsState] = useState<InternalPanelLocation[]>([])
  const [journeysState, setJourneysState] = useState<MapJourney[]>([])
  const [mapStyle, setMapStyle] = useState<string>('mapbox://styles/mapbox/streets-v12');

  const setResults = useCallback((next: any[]) => {
    setResultsState(Array.isArray(next) ? next : [])
  }, [])

  const clearResults = useCallback(() => {
    setResultsState([])
  }, [])

  const showLocation = useCallback((location: PanelLocation, options?: ShowLocationOptions) => {
    setExternalLocationsState(prev => {
      const candidate = toInternalLocation(location)
      if (options?.append) {
        const withoutDuplicate = prev.filter(item => item.id !== candidate.id)
        return [...withoutDuplicate, candidate]
      }
      return [candidate]
    })

    if (!options?.preserveJourneys) {
      setJourneysState([])
    }
  }, [])

  const showLocations = useCallback((locations: PanelLocation[], options?: ShowLocationOptions) => {
    if (!locations.length) {
      setExternalLocationsState([])
      if (!options?.preserveJourneys) {
        setJourneysState([])
      }
      return
    }

    setExternalLocationsState(prev => {
      const mapped = locations.map(location => toInternalLocation(location))
      if (options?.append) {
        const existingById = new Map(prev.map(item => [item.id, item]))
        mapped.forEach(item => existingById.set(item.id, item))
        return Array.from(existingById.values())
      }
      return mapped
    })

    if (!options?.preserveJourneys) {
      setJourneysState([])
    }
  }, [])

  const clearLocations = useCallback(() => {
    setExternalLocationsState([])
  }, [])

  const acknowledgeExternalLocation = useCallback(() => {
    setExternalLocationsState(prev => prev.map(location => ({ ...location, focus: false })))
  }, [])

  const showJourney = useCallback((journey: MapJourney) => {
    setJourneysState([journey])
  }, [])

  const clearJourneys = useCallback(() => {
    setJourneysState([])
  }, [])

  const externalLocations = useMemo<PanelLocation[]>(() => externalLocationsState.map(location => ({ ...location })), [externalLocationsState])
  const journeys = useMemo(() => journeysState, [journeysState])

  const value = useMemo<RecommendPanelContextValue>(() => ({
    results,
    setResults,
    clearResults,
    showLocation,
    showLocations,
    clearLocations,
    externalLocations,
    acknowledgeExternalLocation,
    journeys,
    showJourney,
    clearJourneys,
    mapStyle,
    setMapStyle,
  }), [results, setResults, clearResults, showLocation, showLocations, clearLocations, externalLocations, acknowledgeExternalLocation, journeys, showJourney, clearJourneys, mapStyle, setMapStyle])

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
