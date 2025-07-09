import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "BookingSmart Backoffice",
  description: "Backoffice for BookingSmart",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
