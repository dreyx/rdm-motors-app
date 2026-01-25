"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000] py-4 border-b border-white/10 backdrop-blur-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center transition-transform hover:scale-105 active:scale-95">
          <div className="relative h-10 w-40 sm:h-12 sm:w-48">
            <Image
              src="/rdm-logo.png"
              alt="RDM Motors LLC"
              fill
              className="object-contain object-left pointer-events-none"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Button
            className="bg-gradient-to-r from-brand-red to-red-700 hover:from-red-700 hover:to-brand-red text-white font-black px-5 sm:px-8 rounded-none uppercase text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-red/20 transition-all hover:-translate-y-0.5"
            asChild
          >
            <a href="tel:6418624429">
              <Phone className="h-4 w-4" />
              <span>Call Now</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
