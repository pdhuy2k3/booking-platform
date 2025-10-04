import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "@/styles/globals.css"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import { PreferencesProvider } from "@/contexts/preferences-context"
import { BookingProvider } from "@/contexts/booking-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "BookingSmart - Smart Travel Planning",
  description: "AI-powered travel planning platform for flights and hotels",
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased h-full bg-background text-foreground`}>
        <ThemeProvider>
          <AuthProvider>
            <PreferencesProvider>
              <BookingProvider>
                <div className="flex h-full bg-background">
                  <Suspense
                    fallback={
                      <div className="w-24 flex items-center justify-center border-r border-border text-xs text-muted-foreground">
                        Loading…
                      </div>
                    }
                  >
                    <Sidebar />
                  </Suspense>
                  <main className="flex-1 flex flex-col relative overflow-y-auto bg-background">
                    <Suspense fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-muted-foreground">Loading...</div>
                      </div>
                    }>
                      {children}
                    </Suspense>
                  </main>
                </div>
              </BookingProvider>
            </PreferencesProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
