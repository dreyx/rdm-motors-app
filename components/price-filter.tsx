"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const priceRanges = [
  { label: "Under $5,000", value: 5000 },
  { label: "Under $10,000", value: 10000 },
  { label: "Under $15,000", value: 15000 },
  { label: "Under $20,000", value: 20000 },
  { label: "Under $25,000", value: 25000 },
]

interface PriceFilterProps {
  onFilterChange: (maxPrice: number | null) => void
}

export function PriceFilter({ onFilterChange }: PriceFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)

  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price)
    onFilterChange(price)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSelectedPrice(null)
    onFilterChange(null)
  }

  return (
    <div className="relative">
      <Button variant="outline" className="w-full justify-between bg-white" onClick={() => setIsOpen(!isOpen)}>
        <span className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4 text-primary" />
          Filter by Price
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-lg z-10">
          <div className="py-1">
            {priceRanges.map((range) => (
              <button
                key={range.value}
                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => handlePriceSelect(range.value)}
              >
                {range.label}
              </button>
            ))}
            {selectedPrice && (
              <button
                className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-muted transition-colors border-t"
                onClick={handleClear}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
