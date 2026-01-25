import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllVehicles } from "@/lib/store"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")

    if (!adminSession?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vehicles = await getAllVehicles();

    // Sort by created_at desc
    vehicles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error("[v0] Admin API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
