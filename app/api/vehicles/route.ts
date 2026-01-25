import { NextResponse } from "next/server"
import { getVehiclesByStatus } from "@/lib/store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "available"

    const vehicles = await getVehiclesByStatus(status)
    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ vehicles: [] })
  }
}
