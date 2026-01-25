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
            <Button className="w-full bg-brand-red hover:bg-red-700 text-white text-lg font-black uppercase tracking-wide h-16 rounded-none shadow-xl transition-all hover:translate-y-0.5 active:translate-y-1" asChild>
                <a href={`tel:${phone}`}>
                    Call to Schedule Test Drive
                </a>
            </Button>
        </div>
    )
}
