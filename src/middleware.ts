import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    // Allow access to root page
    if (req.nextUrl.pathname === '/') {
      return NextResponse.next()
    }
    
    // For all other routes, require authentication
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to root page
        if (req.nextUrl.pathname === '/') {
          return true
        }
        
        // Allow access to static files (images, CSS, JS, etc.)
        const staticFileExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.css', '.js']
        const hasStaticExtension = staticFileExtensions.some(ext => 
          req.nextUrl.pathname.endsWith(ext)
        )
        if (hasStaticExtension) {
          return true
        }
        
        // Require authentication for all other routes
        return !!token
      }
    },
    pages: {
      signIn: '/',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 