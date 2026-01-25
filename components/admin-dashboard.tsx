"use client"

import { useState } from "react"
import useSWR from "swr"
import { AdminVehicleList } from "@/components/admin-vehicle-list"
import { AddVehicleForm } from "@/components/add-vehicle-form"
import { LogoutButton } from "@/components/logout-button"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  trim: string | null
  price: number
  mileage: number
  status: string
  description: string | null
  vin: string | null
  stock_number: string | null
  body_style: string | null
  condition: string | null
  title_status: string | null
  engine: string | null
  transmission: string | null
  drivetrain: string | null
  fuel_type: string | null
  exterior_color: string | null
  interior_color: string | null
  image_url: string | null
  images: string[]
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" })

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/admin/login"
      throw new Error("Unauthorized")
    }
    throw new Error("Failed to load data")
  }

  const data = await res.json()
  return data
}

export function AdminDashboard() {
  const {
    data: vehiclesData,
    error: vehiclesError,
    isLoading: vehiclesLoading,
    mutate: mutateVehicles,
  } = useSWR<{ vehicles: Vehicle[] }>("/api/admin/vehicles", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    dedupingInterval: 5000,
  })

  const vehicles = vehiclesData?.vehicles || []


  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await mutateVehicles()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Add, edit, and manage your vehicle listings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={vehiclesLoading || isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${vehiclesLoading || isRefreshing ? 'animate-spin' : ''}`} />
            {vehiclesLoading || isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AddVehicleForm onSuccess={() => mutateVehicles()} />
        </div>

        <div className="lg:col-span-2">
          {vehiclesLoading ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-red-600 animate-spin mb-4" />
              <p className="text-neutral-600">Loading inventory...</p>
            </div>
          ) : (
            <AdminVehicleList vehicles={vehicles} onUpdate={() => mutateVehicles()} />
          )}
        </div>
      </div>
    </>
  )
}
