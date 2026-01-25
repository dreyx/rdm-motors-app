import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Simple in-memory rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>()

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"
  return ip
}

function checkRateLimit(clientId: string): { allowed: boolean; retryAfter?: number; message?: string } {
  const now = Date.now()
  const attempt = loginAttempts.get(clientId)

  // First attempt
  if (!attempt) {
    loginAttempts.set(clientId, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  // Check if account is locked
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    const retryAfter = Math.ceil((attempt.lockedUntil - now) / 1000)
    return {
      allowed: false,
      retryAfter,
      message: `Too many failed attempts. Account locked for ${retryAfter} seconds.`,
    }
  }

  // Reset if locked period has expired
  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    loginAttempts.set(clientId, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  // Reset count if more than 15 minutes have passed
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(clientId, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  // Lock account after 5 failed attempts
  if (attempt.count >= 5) {
    const lockDuration = 5 * 60 * 1000 // 5 minutes
    const lockedUntil = now + lockDuration
    loginAttempts.set(clientId, { ...attempt, lockedUntil })
    return {
      allowed: false,
      retryAfter: Math.ceil(lockDuration / 1000),
      message: "Too many failed attempts. Account locked for 5 minutes.",
    }
  }

  // Increment attempt count
  loginAttempts.set(clientId, { count: attempt.count + 1, lastAttempt: now })
  return { allowed: true }
}

function clearRateLimit(clientId: string) {
  loginAttempts.delete(clientId)
}

// Secure password verification using crypto timing-safe comparison
function verifyPassword(inputPassword: string, correctPassword: string): boolean {
  // Basic validation
  if (!inputPassword || !correctPassword) {
    return false
  }

  // Length check first (not timing-safe, but prevents obvious mismatches)
  if (inputPassword.length !== correctPassword.length) {
    return false
  }

  // Timing-safe comparison using crypto
  // Convert strings to buffers for constant-time comparison
  const inputBuffer = Buffer.from(inputPassword, 'utf8')
  const correctBuffer = Buffer.from(correctPassword, 'utf8')

  // Use crypto.timingSafeEqual for constant-time comparison
  try {
    const crypto = require('crypto')
    return crypto.timingSafeEqual(inputBuffer, correctBuffer)
  } catch {
    // Fallback to simple comparison if crypto fails (shouldn't happen)
    return inputPassword === correctPassword
  }
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)

  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const { password } = body

    // Validate input
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Prevent extremely long passwords (DoS protection)
    if (password.length > 500) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(clientId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message || "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.retryAfter?.toString() || "300" },
        }
      )
    }

    // Get admin password from environment
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error("❌ ADMIN_PASSWORD not configured in environment variables")
      return NextResponse.json(
        { error: "Server configuration error. Please contact administrator." },
        { status: 500 }
      )
    }

    // Verify password using timing-safe comparison
    const isValid = verifyPassword(password, adminPassword)

    if (!isValid) {
      // Log failed attempt
      console.log(`⚠️  Failed login attempt from ${clientId}`)

      return NextResponse.json(
        { error: "Invalid password. Please try again." },
        { status: 401 }
      )
    }

    // Successful login
    console.log(`✅ Successful login from ${clientId}`)

    // Clear rate limit on success
    clearRateLimit(clientId)

    // Set secure session cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({ success: true, message: "Login successful" })
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("admin-session")
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("❌ Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
