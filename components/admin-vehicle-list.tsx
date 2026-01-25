"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Pencil, ChevronDown, ChevronUp, ImageIcon } from "lucide-react"
import { deleteVehicle, updateVehicleStatus } from "@/app/actions/vehicles"
import { EditVehicleDialog } from "@/components/edit-vehicle-dialog"
import { formatMileage } from "@/lib/format-mileage"

type Vehicle = {
  id: string
  year: number
  make: string
  model: string
  trim: string | null
  price: number
  mileage: number
  transmission: string | null
  description: string | null
  image_url: string | null
  status: string
  title_status?: string | null
  engine?: string | null
  drivetrain?: string | null
  fuel_type?: string | null
  exterior_color?: string | null
  interior_color?: string | null
  body_style?: string | null
  condition?: string | null
  vin?: string | null
  stock_number?: string | null
  images?: string[]
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AdminVehicleList({ vehicles, onUpdate }: { vehicles: Vehicle[]; onUpdate?: () => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showSold, setShowSold] = useState(false)
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null)

  const { availableVehicles, soldVehicles } = useMemo(() => {
    const available = vehicles.filter((v) => v.status === "available")
    const sold = vehicles.filter((v) => v.status === "sold")

    return {
      availableVehicles: available,
      soldVehicles: sold,
    }
  }, [vehicles])

  async function handleDelete(id: string) {
    setDeletingId(id)
    setConfirmDeleteId(null) // Close dialog

    const result = await deleteVehicle(id)

    if (result.success) {
      if (onUpdate) onUpdate()
    } else {
      alert(result.error || "Failed to delete vehicle")
    }

    setDeletingId(null)
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    setUpdatingId(id)
    const newStatus = currentStatus === "available" ? "sold" : "available"
    const result = await updateVehicleStatus(id, newStatus)

    if (result.success) {
      if (onUpdate) onUpdate()
    } else {
      alert(result.error || "Failed to update status")
    }

    setUpdatingId(null)
  }

  function handleEditSuccess() {
    setEditingVehicle(null)
    if (onUpdate) onUpdate()
  }

  function VehicleRow({ vehicle }: { vehicle: Vehicle }) {
    const isExpanded = expandedVehicleId === vehicle.id
    const images = vehicle.images || []

    return (
      <div key={vehicle.id} className="border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors">
        <div className="flex items-start justify-between p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
              </h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">${vehicle.price.toLocaleString()}</p>
              <p>{formatMileage(vehicle.mileage)} miles</p>
              {vehicle.transmission && <p>{vehicle.transmission}</p>}
              {images.length > 0 && (
                <p className="text-blue-600 font-medium flex items-center gap-1 mt-2">
                  <ImageIcon className="h-3 w-3" />
                  {images.length} image{images.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {images.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpandedVehicleId(isExpanded ? null : vehicle.id)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setEditingVehicle(vehicle)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleStatus(vehicle.id, vehicle.status)}
              disabled={updatingId === vehicle.id}
            >
              {updatingId === vehicle.id ? "..." : vehicle.status === "available" ? "Mark Sold" : "Mark Available"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmDeleteId(vehicle.id)}
              disabled={deletingId === vehicle.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded && images.length > 0 && (
          <div className="border-t p-4 bg-muted/30">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={image || "/placeholder.svg"} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Available Inventory ({availableVehicles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableVehicles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No available vehicles in inventory</p>
            ) : (
              availableVehicles.map((vehicle) => <VehicleRow key={vehicle.id} vehicle={vehicle} />)
            )}
          </div>
        </CardContent>
      </Card>

      {soldVehicles.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground">Sold Vehicles ({soldVehicles.length})</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowSold(!showSold)}>
                {showSold ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide Sold
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show Sold
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showSold && (
            <CardContent>
              <div className="space-y-4">
                {soldVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-muted/30">
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold">
                            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                          </h3>
                          <Badge variant="secondary">sold</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="font-semibold text-foreground">${vehicle.price.toLocaleString()}</p>
                          <p>{formatMileage(vehicle.mileage)} miles</p>
                          {vehicle.transmission && <p>{vehicle.transmission}</p>}
                          {vehicle.images && vehicle.images.length > 0 && (
                            <p className="text-blue-600 font-medium flex items-center gap-1 mt-2">
                              <ImageIcon className="h-3 w-3" />
                              {vehicle.images.length} image{vehicle.images.length !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {vehicle.images && vehicle.images.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpandedVehicleId(expandedVehicleId === vehicle.id ? null : vehicle.id)}
                          >
                            {expandedVehicleId === vehicle.id ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setEditingVehicle(vehicle)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(vehicle.id, vehicle.status)}
                          disabled={updatingId === vehicle.id}
                        >
                          {updatingId === vehicle.id ? "..." : "Mark Available"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setConfirmDeleteId(vehicle.id)}
                          disabled={deletingId === vehicle.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {expandedVehicleId === vehicle.id && vehicle.images && vehicle.images.length > 0 && (
                      <div className="border-t p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {vehicle.images.map((image, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img src={image || "/placeholder.svg"} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {editingVehicle && (
        <EditVehicleDialog
          vehicle={{
            ...editingVehicle,
            images: editingVehicle.images?.map((url, i) => ({
              id: `temp-${i}`,
              image_url: url,
              display_order: i
            })) || []
          }}
          open={!!editingVehicle}
          onOpenChange={(open) => !open && setEditingVehicle(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
