"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } catch {
      // Ignore errors
    }
    window.location.href = "/admin/login"
  }

  return (
    <Button onClick={handleLogout} variant="outline" size="sm">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}
