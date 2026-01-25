"use client"

import { useState } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { SoldVehicleCard } from "@/components/sold-vehicle-card"
import { PriceFilter } from "@/components/price-filter"
import { ChevronDown, ChevronUp, Grid3X3, LayoutList } from "lucide-react"
import { EmptyInventoryState } from "@/components/empty-inventory-state"
import { Button } from "@/components/ui/button"

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  trim: string | null
  mileage: number
  transmission: string
  price: number | null
  image_url: string | null
  images?: string[]
  status: string
  created_at?: string
  description?: string | null
  exterior_color?: string | null
  interior_color?: string | null
  fuel_type?: string | null
  drivetrain?: string | null
  engine?: string | null
  body_style?: string | null
  condition?: string | null
  title_status?: string | null
}

interface VehicleGridProps {
  availableVehicles: Vehicle[]
  soldVehicles: Vehicle[]
}

export function VehicleGrid({
  availableVehicles,
  soldVehicles,
}: VehicleGridProps) {
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [showSold, setShowSold] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredAvailableVehicles = availableVehicles.filter((vehicle) => {
    if (maxPrice === null) return true
    if (vehicle.price === null) return true
    return vehicle.price <= maxPrice
  })

  return (
    <div className="space-y-8">
      {/* Available Vehicles Section */}
      <section id="available">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Vehicles</h2>

          <div className="flex items-center gap-3">
            {/* View Toggle Buttons */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-none px-3 h-9 ${viewMode === "grid" ? "bg-gray-100" : "bg-white"}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-none px-3 h-9 border-l border-gray-300 ${viewMode === "list" ? "bg-gray-100" : "bg-white"}`}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>

            {/* Price Filter */}
            <PriceFilter onFilterChange={setMaxPrice} />
          </div>
        </div>

        {/* Vehicle Cards */}
        {filteredAvailableVehicles.length > 0 ? (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-6"
          }>
            {filteredAvailableVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <EmptyInventoryState filteredCount={filteredAvailableVehicles.length} />
        )}
      </section>

      {/* Recently Sold Section */}
      {soldVehicles.length > 0 && (
        <section id="sold" className="pt-6">
          <div
            className="flex items-center justify-between mb-6 px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer group transition-all border border-gray-200"
            onClick={() => setShowSold(!showSold)}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-brand-red transition-colors">Recently Sold</h2>
              {showSold ? (
                <ChevronUp className="h-5 w-5 text-gray-500 group-hover:text-brand-red transition-colors" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-brand-red transition-colors" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-500">
              {soldVehicles.length} {soldVehicles.length === 1 ? 'vehicle' : 'vehicles'}
            </span>
          </div>

          {showSold && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...soldVehicles]
                .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                .map((vehicle) => (
                  <SoldVehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
