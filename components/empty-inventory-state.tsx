"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyInventoryStateProps {
  filteredCount?: number
}

export function EmptyInventoryState({ filteredCount = 0 }: EmptyInventoryStateProps) {
  const isFiltered = filteredCount > 0

  return (
    <div className="w-full min-h-96 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Heading */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {isFiltered ? "No vehicles match your filters" : "Inventory being updated"}
          </h2>
          <p className="text-lg text-gray-600">
            {isFiltered ? "Try adjusting your search criteria" : "New inventory coming in the next few days"}
          </p>
        </div>

        {/* Call to Action */}
        <Link href="tel:(641)862-4429" className="inline-block">
          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 text-base">
            Call (641) 862-4429
          </Button>
        </Link>

        {/* Supporting text */}
        <p className="text-sm text-gray-500">Have questions or looking for something specific? Give us a call.</p>
      </div>
    </div>
  )
}
