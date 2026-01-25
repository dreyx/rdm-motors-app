import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple bot detection based on user agent patterns
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scrape/i, /headless/i,
  /phantomjs/i, /selenium/i, /puppeteer/i, /playwright/i,
  /curl/i, /wget/i, /python-requests/i, /axios/i, /node-fetch/i,
  /libwww/i, /java\//i, /httpclient/i, /okhttp/i,
]

// Suspicious patterns that might indicate automation
const SUSPICIOUS_HEADERS = [
  'x-automation',
  'x-scraper',
  'x-bot',
]

function isLikelyBot(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || ""

  // Check for missing user agent (bots often have empty or missing UA)
  if (!userAgent || userAgent.length < 10) {
    return true
  }

  // Check for known bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return true
    }
  }

  // Check for suspicious headers
  for (const header of SUSPICIOUS_HEADERS) {
    if (request.headers.has(header)) {
      return true
    }
  }

  return false
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    // Check for bots trying to access admin pages
    if (isLikelyBot(request)) {
      // Return a 404 to not reveal admin exists
      return new NextResponse("Not Found", { status: 404 })
    }

    // Login page - allow access but add security headers
    if (pathname === "/admin/login") {
      const response = NextResponse.next()

      // Security headers for login page
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-XSS-Protection", "1; mode=block")
      response.headers.set("Referrer-Policy", "no-referrer")
      response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

      // Prevent robots from indexing
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet")

      return response
    }

    // Protected admin routes - require authentication
    const session = request.cookies.get("admin-session")

    if (!session?.value || session.value !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    const response = NextResponse.next()

    // Enhanced security headers for authenticated admin pages
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet")

    // Content Security Policy for admin
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'"
    )

    return response
  }

  // Admin API routes protection
  if (pathname.startsWith("/api/admin")) {
    // Block bots from API routes
    if (isLikelyBot(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Allow login API without session check
    if (pathname === "/api/admin/login") {
      return NextResponse.next()
    }

    // All other admin API routes require authentication
    const session = request.cookies.get("admin-session")

    if (!session?.value || session.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
