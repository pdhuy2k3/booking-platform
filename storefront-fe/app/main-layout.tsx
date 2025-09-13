"use client"

import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  
  // Determine current view based on pathname
  let currentView = "Chat"
  if (pathname === "/flights") {
    currentView = "Flights"
  } else if (pathname === "/hotels") {
    currentView = "Hotels"
  } else if (pathname === "/bookings") {
    currentView = "Bookings"
  } else if (pathname === "/profile") {
    currentView = "Profile"
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} />
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {children}
      </main>
    </div>
  )
}