"use client"

import { Phone, MapPin, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileActionBar() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="grid grid-cols-2 gap-2">
                <Button
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold h-12 text-lg uppercase tracking-wider"
                    asChild
                >
                    <a href="tel:6418624429">
                        <Phone className="mr-2 h-5 w-5" /> Call Us
                    </a>
                </Button>
                <Button
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-12 text-lg uppercase tracking-wider"
                    asChild
                >
                    <a href="sms:6418624429">
                        <MessageSquare className="mr-2 h-5 w-5" /> Text Us
                    </a>
                </Button>
            </div>
        </div>
    )
}
