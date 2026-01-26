"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { updateVehicle, updateVehicleImages } from "@/app/actions/vehicles"
import { useRouter } from "next/navigation"
import { ImageUploadZone } from "@/components/image-upload-zone"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

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
  images?: Array<{
    id: string
    image_url: string
    display_order: number
  }>
}

interface ImageItem {
  id: string
  url: string
}

const CURRENT_YEAR = new Date().getFullYear()

export function EditVehicleDialog({
  vehicle,
  open,
  onOpenChange,
  onSuccess,
}: {
  vehicle: Vehicle
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [status, setStatus] = useState("")
  const [images, setImages] = useState<ImageItem[]>([])
  const [originalImages, setOriginalImages] = useState<ImageItem[]>([])
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    if (!open) return

    const loadedImages: ImageItem[] = []

    if (vehicle.images && vehicle.images.length > 0) {
      vehicle.images.forEach((img) => {
        loadedImages.push({
          id: img.id,
          url: img.image_url,
        })
      })
    } else if (vehicle.image_url) {
      loadedImages.push({ id: `legacy-${vehicle.id}`, url: vehicle.image_url })
    }

    setImages(loadedImages)
    setOriginalImages(loadedImages)
    setError(null)
    setSuccess(false)
    setStatus("")
    setFailedFields(new Set())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFailedFields(new Set())
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const newFailedFields = new Set<string>()

    // Validation
    const requiredFields = ["year", "make", "model", "mileage", "price", "title_status"]
    requiredFields.forEach(field => {
      const val = formData.get(field)
      if (!val || val.toString().trim() === "") {
        newFailedFields.add(field)
      }
    })

    if (newFailedFields.size > 0) {
      setFailedFields(newFailedFields)
      setError("Please fill in all highlighted fields.")
      return
    }

    setIsSubmitting(true)

    try {
      setStatus("Updating vehicle...")

      const result = await updateVehicle(vehicle.id, formData)

      if (!result.success) {
        setError(result.error || "Failed to update vehicle")
        setIsSubmitting(false)
        setStatus("")
        return
      }

      const currentUrls = images.map((img) => img.url)
      const originalUrls = originalImages.map((img) => img.url)

      const existingUrls = currentUrls.filter((url) => url.startsWith("http"))
      const newImageData = images
        .filter((img) => img.url && img.url.startsWith("data:image"))
        .map((img, idx) => ({ url: img.url, order: idx }))

      const imagesChanged =
        currentUrls.length !== originalUrls.length ||
        currentUrls.some((url, i) => url !== originalUrls[i]) ||
        newImageData.length > 0

      if (imagesChanged) {
        setStatus("Updating images...")
        const imageResult = await updateVehicleImages(vehicle.id, existingUrls, newImageData)

        if (!imageResult.success) {
          setError(`Vehicle saved but images failed: ${imageResult.error}`)
          setIsSubmitting(false)
          setStatus("")
          return
        }
      }

      setSuccess(true)
      setStatus("Updated successfully!")
      setIsSubmitting(false)

      setTimeout(() => {
        onOpenChange(false)
        setStatus("")
        if (onSuccess) {
          onSuccess()
        }
      }, 800)
    } catch (err) {
      console.error("[EditVehicleDialog] Error:", err)
      setIsSubmitting(false)
      setStatus("")
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    }
  }

  const getErrorClass = (name: string) => {
    return failedFields.has(name) ? "border-red-500 ring-2 ring-red-500 bg-red-50" : ""
  }

  // Required field label component
  const RequiredLabel = ({ htmlFor, children, hasError }: { htmlFor: string; children: React.ReactNode; hasError?: boolean }) => (
    <Label htmlFor={htmlFor} className={`flex items-center gap-1 ${hasError ? "text-red-600 font-semibold" : ""}`}>
      {children}
      <span className="text-red-500 text-lg leading-none">*</span>
      {hasError && <span className="text-xs text-red-500 ml-1">(Required)</span>}
    </Label>
  )

  const requiredFieldBase = "border-l-4 border-l-red-400"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Edit Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fields marked with <span className="text-red-500 font-bold">*</span> are required
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Identity */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Vehicle Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <RequiredLabel htmlFor="year" hasError={failedFields.has("year")}>Year</RequiredLabel>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max="2099"
                  defaultValue={vehicle.year}
                  className={`${requiredFieldBase} ${getErrorClass("year")}`}
                />
              </div>
              <div>
                <RequiredLabel htmlFor="make" hasError={failedFields.has("make")}>Make</RequiredLabel>
                <Input
                  id="make"
                  name="make"
                  defaultValue={vehicle.make}
                  className={`${requiredFieldBase} ${getErrorClass("make")}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <RequiredLabel htmlFor="model" hasError={failedFields.has("model")}>Model</RequiredLabel>
                <Input
                  id="model"
                  name="model"
                  defaultValue={vehicle.model}
                  className={`${requiredFieldBase} ${getErrorClass("model")}`}
                />
              </div>
              <div>
                <Label htmlFor="trim">Trim</Label>
                <Input id="trim" name="trim" defaultValue={vehicle.trim || ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" name="vin" defaultValue={vehicle.vin || ""} maxLength={17} />
              </div>
              <div>
                <Label htmlFor="stock_number">Stock Number</Label>
                <Input id="stock_number" name="stock_number" defaultValue={vehicle.stock_number || ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="body_style">Body Style</Label>
                <Select name="body_style" defaultValue={vehicle.body_style || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Coupe">Coupe</SelectItem>
                    <SelectItem value="Convertible">Convertible</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Wagon">Wagon</SelectItem>
                    <SelectItem value="Hatchback">Hatchback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select name="condition" defaultValue={vehicle.condition || "Used"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Certified">Certified Pre-Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <RequiredLabel htmlFor="title_status" hasError={failedFields.has("title_status")}>Title Status</RequiredLabel>
              <Select name="title_status" defaultValue={vehicle.title_status || "Clean"}>
                <SelectTrigger className={`${requiredFieldBase} ${getErrorClass("title_status")}`}>
                  <SelectValue placeholder="Select title status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clean">Clean</SelectItem>
                  <SelectItem value="Rebuilt">Rebuilt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mechanical Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Mechanical Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engine">Engine</Label>
                <Input id="engine" name="engine" defaultValue={vehicle.engine || ""} placeholder="e.g., 3.6L V6" />
              </div>
              <div>
                <Label htmlFor="transmission">Transmission</Label>
                <Select name="transmission" defaultValue={vehicle.transmission || "Automatic"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="drivetrain">Drivetrain</Label>
                <Select name="drivetrain" defaultValue={vehicle.drivetrain || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select drivetrain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FWD">FWD</SelectItem>
                    <SelectItem value="RWD">RWD</SelectItem>
                    <SelectItem value="AWD">AWD</SelectItem>
                    <SelectItem value="4WD">4WD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select name="fuel_type" defaultValue={vehicle.fuel_type || "Gas"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gas">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Exterior & Interior */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Exterior & Interior</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exterior_color">Exterior Color</Label>
                <Input id="exterior_color" name="exterior_color" defaultValue={vehicle.exterior_color || ""} />
              </div>
              <div>
                <Label htmlFor="interior_color">Interior Color</Label>
                <Input id="interior_color" name="interior_color" defaultValue={vehicle.interior_color || ""} />
              </div>
            </div>
          </div>

          {/* Mileage & Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Mileage & Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <RequiredLabel htmlFor="mileage" hasError={failedFields.has("mileage")}>Mileage</RequiredLabel>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  min="0"
                  defaultValue={vehicle.mileage}
                  className={`${requiredFieldBase} ${getErrorClass("mileage")}`}
                />
              </div>
              <div>
                <RequiredLabel htmlFor="price" hasError={failedFields.has("price")}>Price</RequiredLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={vehicle.price}
                  className={`${requiredFieldBase} ${getErrorClass("price")}`}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={4} defaultValue={vehicle.description || ""} />
          </div>

          {/* Images */}
          <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50">
            <Label className="text-base font-medium">Vehicle Images</Label>
            <p className="text-xs text-muted-foreground mb-3">Add, remove, or reorder images</p>
            <ImageUploadZone images={images} onImagesChange={setImages} />
            {images.length > 0 && (
              <p className="text-sm text-green-600 font-medium mt-2">
                ✓ {images.length} image{images.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              Updated successfully!
            </div>
          )}

          {status && !success && !error && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              {status}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 min-w-[140px]">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
