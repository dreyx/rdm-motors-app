"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [honeypot, setHoneypot] = useState("") // Anti-bot honeypot field
  const [loadTime] = useState(Date.now()) // Track page load time for bot detection
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials")
      }

      window.location.href = "/admin"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Access denied")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-xs">
        <form onSubmit={handleSubmit}>
          {/* Honeypot field - hidden from users, bots will fill it */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            style={{
              position: 'absolute',
              left: '-9999px',
              opacity: 0,
              height: 0,
              width: 0,
              pointerEvents: 'none'
            }}
          />

          {/* Password input - minimal styling */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            autoFocus
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-center text-gray-800 bg-gray-50"
          />

          {/* Error message - subtle */}
          {error && (
            <p className="mt-3 text-center text-sm text-red-500">{error}</p>
          )}
        </form>
      </div>
    </div>
  )
}
