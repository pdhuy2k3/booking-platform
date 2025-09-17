import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import { PreferencesProvider } from "@/contexts/preferences-context"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "TravelAI - Smart Travel Booking",
  description: "AI-powered travel booking platform for flights and hotels",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
        <html lang="en" className="dark">
          <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
            <AuthProvider>
              <PreferencesProvider>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <main className="flex-1 flex flex-col relative overflow-y-auto">
                    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading...</div>}>
                      {children}
                    </Suspense>
                  </main>
                </div>
              </PreferencesProvider>
            </AuthProvider>
            <Toaster />
            <Analytics />
          </body>
        </html>
  )
}
