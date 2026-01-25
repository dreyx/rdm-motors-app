"use client"

import { Button } from "@/components/ui/button"

interface VehicleActionsProps {
    phone: string
    vehicleName?: string
}

export function VehicleActions({ phone, vehicleName = "this vehicle" }: VehicleActionsProps) {
    return (
        <div className="space-y-3">
            {/* Primary Call Action */}
            {/* Primary Action */}
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-14 rounded-lg shadow-lg transition-all" asChild>
                <a href={`tel:${phone}`}>
                    Confirm Availability
                </a>
            </Button>

            <p className="text-center text-xs text-slate-400 font-medium">
                Call/Text for quick response
            </p>
        </div>
    )
}
