"use client"

import { Button } from "@/components/ui/button"

interface VehicleActionsProps {
    phone: string
    vehicleName?: string
}

export function VehicleActions({ phone, vehicleName = "this vehicle" }: VehicleActionsProps) {
    return (
        <div className="space-y-3">
            {/* Primary Action */}
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-14 rounded-lg shadow-lg transition-all" asChild>
                <a href={`tel:${phone}`}>
                    Call to Schedule A Test Drive
                </a>
            </Button>
        </div>
    )
}
