"use client"

import type React from "react"
import { formatMileage } from "@/lib/format-mileage"
import { useState } from "react"
import { Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface VehicleCardProps {
  vehicle: {
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
  isSold?: boolean
  viewMode?: "grid" | "list"
}

export function VehicleCard({ vehicle, isSold = false, viewMode = "list" }: VehicleCardProps) {
  const allImages =
    vehicle.images && vehicle.images.length > 0 ? vehicle.images : vehicle.image_url ? [vehicle.image_url] : []
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const displayImage = allImages[currentImageIndex]

  const NoImagePlaceholder = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-b border-gray-100">
      <div className="relative h-12 w-32 mb-3 opacity-20 grayscale transition-opacity group-hover:opacity-30">
        <Image src="/rdm-logo.png" alt="RDM Motors" fill className="object-contain" />
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Coming Soon</p>
        <p className="text-[10px] text-gray-300">Image Processing</p>
      </div>
    </div>
  )

  // Generate auto-description if no description exists
  const autoDescription = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''} ${vehicle.drivetrain ? `with a ${vehicle.engine || 'powerful engine'}` : ''} ${vehicle.transmission?.toLowerCase()} transmission with ${formatMileage(vehicle.mileage)} miles.${vehicle.title_status ? ` ${vehicle.title_status} Title` : ''}`

  const displayDescription = vehicle.description || autoDescription

  return (
    <Card className="premium-card group overflow-hidden flex flex-col bg-white border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
      <Link href={`/vehicles/${vehicle.id}`} className="flex-1 flex flex-col group/link">
        {/* Image section */}
        <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage || "/placeholder.svg"}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover/link:scale-105"
              priority={currentImageIndex === 0}
              quality={90}
            />
          ) : (
            <NoImagePlaceholder />
          )}

          {isSold && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="bg-brand-red text-white px-6 py-2 font-black text-xl shadow-lg border-2 border-white uppercase tracking-wider">
                SOLD
              </div>
            </div>
          )}

          {vehicle.price && !isSold && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-white/95 backdrop-blur-sm text-brand-black font-black px-3 py-1.5 text-lg shadow-sm border border-slate-100">
                ${vehicle.price.toLocaleString()}
              </div>
            </div>
          )}

          {/* Hover Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {allImages.length > 1 && (
            <div className="absolute inset-x-0 bottom-0 py-3 flex items-center justify-between px-3 opacity-0 group-hover/link:opacity-100 transition-all duration-300 z-10" onClick={(e) => e.preventDefault()}>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-black h-8 w-8 rounded-full shadow-sm"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white text-black h-8 w-8 rounded-full shadow-sm"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-5 flex-1 border-t border-slate-100/50">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{vehicle.year} {vehicle.make}</p>
            <h3 className="text-xl font-bold text-slate-900 group-hover/link:text-brand-red transition-colors leading-tight">
              {vehicle.model}
            </h3>
            <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-wide">{vehicle.trim || "Base"}</p>
          </div>

          {/* Specs Grid - Horizontal Lines */}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mileage</span>
              <span className="font-bold text-slate-700">{formatMileage(vehicle.mileage)} mi</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Transmission</span>
              <span className="font-bold text-slate-700">{vehicle.transmission || "Auto"}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Engine</span>
              <span className="font-bold text-slate-700 truncate max-w-[120px] text-right">{vehicle.fuel_type || "Gas"}</span>
            </div>
          </div>
        </CardContent>
      </Link>

      <div className="px-5 pb-5">
        {/* CTA Button */}
        {!isSold ? (
          <Button
            className="w-full bg-brand-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest h-12 rounded-none flex items-center justify-center gap-2 transition-all shadow-md hover:-translate-y-0.5"
            asChild
          >
            <a href="tel:6418624429">
              <Phone className="h-4 w-4" />
              <span>Call for Details</span>
            </a>
          </Button>
        ) : (
          <Button
            className="w-full bg-slate-100 text-slate-400 cursor-not-allowed font-bold text-xs uppercase tracking-widest h-12 rounded-none"
            variant="ghost"
            disabled
          >
            Sold
          </Button>
        )}
      </div>
    </Card>
  )
}
