"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem("theme") as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      // Use system preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(systemPrefersDark)
      if (systemPrefersDark) {
        root.classList.add("dark")
      } else {
        root.classList.add("light")
      }
    } else {
      // Use manual theme
      setIsDark(theme === "dark")
      root.classList.add(theme)
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    // Listen for system theme changes when in system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches)
        const root = document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(e.matches ? "dark" : "light")
      }
      
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}