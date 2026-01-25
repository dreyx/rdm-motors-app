
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Phone, Gauge, Settings, Fuel, Calendar, ShieldCheck, MapPin, Info, CheckCircle2 } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { VehicleImageGallery } from "@/components/vehicle-image-gallery"
import { formatMileage } from "@/lib/format-mileage"
import { getAllVehicles } from "@/lib/store"
import { VehicleActions } from "@/components/vehicle-actions"

export const revalidate = 60

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const vehicles = await getAllVehicles()
  const vehicle = vehicles.find((v) => v.id === id)

  if (!vehicle) {
    notFound()
  }

  const images = vehicle.images || []

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-200/50 font-sans text-slate-900 antialiased">
      <Header />

      <main className="flex-1 pb-16">
        {/* Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-slate-500 hover:text-brand-red transition-all font-bold text-xs uppercase tracking-widest gap-2 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Inventory
            </Link>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Stock: #{id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Main Content (left) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Mobile Header */}
              <div className="lg:hidden mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse"></span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{vehicle.year} {vehicle.make}</p>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  {vehicle.model}
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-bold tracking-wide uppercase">{vehicle.trim}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-brand-red tracking-tighter">${vehicle.price?.toLocaleString()}</span>
                </div>
              </div>

              {/* Gallery Section - Adjusted for 100% feel */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200 transition-all duration-500">
                <VehicleImageGallery images={images} vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
              </div>

              {/* Description Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <Info className="h-4 w-4 text-brand-red" />
                  </div>
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Property Overview</h2>
                </div>
                {vehicle.description ? (
                  <div className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line max-w-none">
                    {vehicle.description}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-sm">Description pending verification.</p>
                )}
              </div>
            </div>

            {/* Sidebar (right) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">

              {/* Pricing & Actions Card - Streamlined */}
              <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 p-6 hidden lg:block">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red"></span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{vehicle.year} {vehicle.make}</p>
                  </div>
                  <h1 className="text-3xl font-black text-brand-black tracking-tighter uppercase leading-none">{vehicle.model}</h1>
                  <p className="text-slate-500 font-bold mt-1 text-xs uppercase tracking-widest">{vehicle.trim}</p>
                </div>

                <div className="flex flex-col mb-6 border-y border-slate-100 py-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">No-Haggle Price</span>
                  <span className="text-5xl font-black text-brand-red tracking-tighter leading-none">${vehicle.price?.toLocaleString()}</span>
                </div>

                <VehicleActions phone="6418624429" vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
              </div>

              {/* Specifications - Grid Layout */}
              <div className="bg-white shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                  <Gauge className="h-4 w-4 text-brand-red" />
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Specifications</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Mileage', value: `${formatMileage(vehicle.mileage)} mi` },
                    { label: 'Transmission', value: vehicle.transmission || "Automatic" },
                    { label: 'Fuel Type', value: vehicle.fuel_type || "Gasoline" },
                    { label: 'Model Year', value: vehicle.year }
                  ].map((spec, i) => (
                    <div key={i} className="space-y-1 p-3 bg-slate-50/50 border border-transparent hover:border-slate-100 transition-colors">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">{spec.label}</p>
                      <p className="font-bold text-slate-900 text-sm">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Mini-Card */}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
