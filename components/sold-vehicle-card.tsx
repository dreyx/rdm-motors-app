"use client"

import Image from "next/image"
import { Facebook } from "lucide-react"

interface SoldVehicleCardProps {
    vehicle: {
        id: string
        year: number
        make: string
        model: string
        trim: string | null
        image_url: string | null
        images?: string[]
    }
}

export function SoldVehicleCard({ vehicle }: SoldVehicleCardProps) {
    const displayImage =
        vehicle.images && vehicle.images.length > 0
            ? vehicle.images[0]
            : vehicle.image_url || null

    const NoImagePlaceholder = () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
            <div className="relative h-8 w-24 opacity-20 grayscale">
                <Image src="/rdm-logo.png" alt="RDM Motors" fill className="object-contain" />
            </div>
        </div>
    )

    return (
        <div className="group cursor-default">
            {/* Image with SOLD badge */}
            <div className="aspect-[16/10] bg-brand-gray-light relative overflow-hidden rounded-xl border border-brand-gray-border shadow-sm transition-all duration-500 group-hover:shadow-md">
                {displayImage ? (
                    <Image
                        src={displayImage || "/placeholder.svg"}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        quality={75}
                    />
                ) : (
                    <NoImagePlaceholder />
                )}

                {/* SOLD badge */}
                <div className="absolute inset-0 flex items-center justify-center bg-brand-black/20 backdrop-blur-[1px] opacity-100 group-hover:opacity-40 transition-opacity duration-500">
                    <div className="bg-brand-red text-white px-6 py-1.5 rounded-none font-black text-xs shadow-xl border-2 border-white uppercase tracking-tighter scale-100 group-hover:scale-110 transition-transform">
                        SOLD
                    </div>
                </div>
            </div>

            {/* Vehicle Info */}
            <div className="mt-3 px-1">
                <h4 className="text-sm font-black text-brand-black uppercase tracking-tight truncate leading-tight">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                </h4>
                {vehicle.trim && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{vehicle.trim}</p>
                )}
                <div className="flex items-center gap-1 mt-2">
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                        <Facebook className="h-2.5 w-2.5" />
                        Facebook Marketplace
                    </span>
                </div>
            </div>
        </div>
    )
}
