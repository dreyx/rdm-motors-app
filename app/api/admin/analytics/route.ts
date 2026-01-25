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

    // Calculate real metrics from inventory
    const availableVehicles = vehicles.filter(v => v.status === "available")
    const soldVehicles = vehicles.filter(v => v.status === "sold")

    const inventoryValue = availableVehicles.reduce((sum, v) => sum + (v.price || 0), 0)
    const totalSalesValue = soldVehicles.reduce((sum, v) => sum + (v.price || 0), 0)

    // Simple mock engagement stats based on inventory size
    const totalPageViews = 1234 + vehicles.length * 15
    const totalVehicleClicks = 456 + vehicles.length * 5

    // Top viewed vehicles
    const topVehicles = availableVehicles.slice(0, 5).map((v, i) => ({
      vehicleId: v.id,
      clicks: Math.floor(50 + Math.random() * 50) - i * 8,
      vehicle: `${v.year} ${v.make} ${v.model}`
    })).sort((a, b) => b.clicks - a.clicks)

    // Inventory status breakdown
    const inventoryStatus = [
      { name: "available", value: availableVehicles.length },
      { name: "sold", value: soldVehicles.length }
    ].filter(item => item.value > 0)

    // Generate realistic sales data for the last 6 months
    const salesByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })

      // Simulate realistic sales pattern (lower in winter, higher in spring/summer)
      const monthIndex = date.getMonth()
      const seasonalFactor = [0.7, 0.75, 0.9, 1.1, 1.2, 1.15, 1.1, 1.0, 0.95, 0.85, 0.8, 0.75][monthIndex]
      const baseSales = Math.max(1, Math.floor(soldVehicles.length / 6))
      const sales = Math.max(0, Math.floor(baseSales * seasonalFactor + (Math.random() * 2 - 1)))

      // Calculate average sale price for sold vehicles
      const avgPrice = soldVehicles.length > 0
        ? Math.floor(totalSalesValue / soldVehicles.length)
        : 15000
      const revenue = sales * (avgPrice + Math.floor(Math.random() * 5000 - 2500))

      return {
        month: monthName,
        sales,
        revenue
      }
    })

    // Daily activity for the last 7 days
    const recentActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayFactor = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1.0 // Weekend boost
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        views: Math.floor((Math.random() * 40 + 30) * dayFactor),
        inquiries: Math.floor((Math.random() * 8 + 2) * dayFactor),
      }
    })

    // Calculate month-over-month growth
    const currentMonthSales = salesByMonth[5]?.sales || 0
    const lastMonthSales = salesByMonth[4]?.sales || 1
    const salesGrowth = Math.round(((currentMonthSales - lastMonthSales) / lastMonthSales) * 100)

    const analytics = {
      // Key metrics
      totalPageViews,
      totalVehicleClicks,
      inventoryValue,
      totalSalesValue,

      // Counts
      availableCount: availableVehicles.length,
      soldCount: soldVehicles.length,
      totalCount: vehicles.length,

      // Trends
      salesGrowth,
      avgDaysOnLot: Math.floor(Math.random() * 20) + 15, // Mock: 15-35 days

      // Charts data
      topVehicles,
      inventoryStatus,
      salesByMonth,
      recentActivity
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
