"use client"

import { Button } from "@/components/ui/button"
import { Plane, Hotel, MapPin, Calendar } from "lucide-react"
import { useState } from "react"

interface WelcomeScreenProps {
  onExampleClick: (prompt: string) => void
}

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  const examplePrompts = [
    "Find flights from New York to Paris for next week",
    "Show me luxury hotels in Tokyo under $300/night",
    "Plan a weekend trip to Barcelona with flights and hotels",
    "Compare prices for business class flights to London",
  ]

  const [isProcessing, setIsProcessing] = useState(false)

  const handleExampleClick = async (prompt: string) => {
    if (isProcessing) return
    setIsProcessing(true)
    onExampleClick(prompt)
    // Reset after a short delay to prevent rapid clicking
    setTimeout(() => setIsProcessing(false), 1000)
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Glowing lines/paths */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="glow1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
            </linearGradient>
            <filter id="blur">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <path
            d="M100,400 Q300,200 600,350 T1100,300"
            stroke="url(#glow1)"
            strokeWidth="2"
            fill="none"
            filter="url(#blur)"
            className="animate-pulse"
          />
          <path
            d="M200,600 Q500,400 800,550 T1000,500"
            stroke="url(#glow1)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#blur)"
            className="animate-pulse delay-700"
          />
        </svg>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-balance bg-linear-to-r from-white via-cyan-100 to-emerald-100 bg-clip-text text-transparent">
            Ask TravelAI
          </h1>
        </div>

        <div className="space-y-4">
          {examplePrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full text-left justify-start h-auto p-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
              onClick={() => handleExampleClick(prompt)}
              disabled={isProcessing}
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border border-muted-foreground/30 group-hover:border-cyan-400 transition-colors" />
                <span className="text-sm">{prompt}</span>
              </div>
            </Button>
          ))}
        </div>

        <div className="flex justify-center gap-6 pt-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Plane className="w-5 h-5 text-cyan-400" />
            <span className="text-sm">Flights</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hotel className="w-5 h-5 text-emerald-400" />
            <span className="text-sm">Hotels</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span className="text-sm">Destinations</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span className="text-sm">Planning</span>
          </div>
        </div>
      </div>
    </div>
  )
}
