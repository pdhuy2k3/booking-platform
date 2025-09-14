import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access to all pages if token exists (user is authenticated)
        // You can customize this logic to protect specific routes
        return !!token
      },
    },
  }
)

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/profile/:path*',
    '/bookings/:path*',
    '/api/bookings/:path*',
  ],
}