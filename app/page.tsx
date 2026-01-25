
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { VehicleGrid } from "@/components/vehicle-grid"
import { getVehiclesByStatus } from "@/lib/store"


export const revalidate = 3600

export default async function Home() {
  let availableVehicles: any[] = []
  let soldVehicles: any[] = []

  try {
    availableVehicles = await getVehiclesByStatus('available');
    soldVehicles = await getVehiclesByStatus('sold');
  } catch (error) {
    console.error("[v0] Error fetching vehicles:", error)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-4"></div>

      <main className="flex-1 container mx-auto px-4 py-12">
        <VehicleGrid availableVehicles={availableVehicles} soldVehicles={soldVehicles} />
      </main>

      <Footer />
    </div>
  )
}
