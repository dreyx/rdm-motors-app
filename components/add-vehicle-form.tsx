"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addVehicle, uploadSingleVehicleImage } from "@/app/actions/vehicles"
import { useRouter } from "next/navigation"
import { ImageUploadZone } from "@/components/image-upload-zone"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface ImageItem {
  id: string
  url: string
}

interface AddVehicleFormProps {
  onSuccess?: () => void
}

export function AddVehicleForm({ onSuccess }: AddVehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [uploadProgress, setUploadProgress] = useState("")
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatusMessage(null)

    if (images.length < 1) {
      setStatusMessage({ type: "error", message: "Please add at least 1 image before submitting" })
      return
    }

    if (images.length > 15) {
      setStatusMessage({ type: "error", message: `Maximum 15 images allowed (you have ${images.length})` })
      return
    }

    setIsSubmitting(true)
    setUploadProgress("Creating vehicle listing...")

    const formData = new FormData(e.currentTarget)

    try {
      const result = await addVehicle(formData)

      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error || "Failed to create vehicle" })
        setIsSubmitting(false)
        setUploadProgress("")
        return
      }

      const vehicleId = result.vehicleId!

      let successCount = 0
      for (let i = 0; i < images.length; i++) {
        setUploadProgress(`Uploading image ${i + 1} of ${images.length}...`)

        try {
          const imageResult = await uploadSingleVehicleImage(vehicleId, {
            url: images[i].url,
            order: i,
          })

          if (imageResult.success) {
            successCount++
          }
        } catch (imgError) {
          // Continue with next image
        }

        // Small delay between uploads
        if (i < images.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      setUploadProgress("")
      setIsSubmitting(false)

      if (successCount === images.length) {
        setStatusMessage({
          type: "success",
          message: `Vehicle added successfully with ${successCount} images!`,
        })
      } else {
        setStatusMessage({
          type: "success",
          message: `Vehicle added! ${successCount} of ${images.length} images uploaded successfully.`,
        })
      }

      // Reset form
      e.currentTarget.reset()
      setImages([])
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }

      // Clear success message after 5 seconds
      setTimeout(() => setStatusMessage(null), 5000)
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      })
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Vehicle</CardTitle>
        {statusMessage && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              statusMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{statusMessage.message}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Identity */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Vehicle Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input id="year" name="year" type="number" required min="1900" max="2099" />
              </div>
              <div>
                <Label htmlFor="make">Make *</Label>
                <Input id="make" name="make" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input id="model" name="model" required />
              </div>
              <div>
                <Label htmlFor="trim">Trim</Label>
                <Input id="trim" name="trim" placeholder="e.g., EX-L" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" name="vin" placeholder="17-digit VIN" maxLength={17} />
              </div>
              <div>
                <Label htmlFor="stock_number">Stock Number</Label>
                <Input id="stock_number" name="stock_number" placeholder="Internal stock #" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="body_style">Body Style</Label>
                <Select name="body_style">
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
                <Select name="condition" defaultValue="Used">
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
              <Label htmlFor="title_status">Title *</Label>
              <Select name="title_status" required>
                <SelectTrigger>
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
            <h3 className="font-semibold text-sm text-gray-700">Mechanical Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engine">Engine</Label>
                <Input id="engine" name="engine" placeholder="e.g., 3.6L V6" />
              </div>
              <div>
                <Label htmlFor="transmission">Transmission</Label>
                <Select name="transmission" defaultValue="Automatic">
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
                <Select name="drivetrain">
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
                <Select name="fuel_type" defaultValue="Gas">
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
            <h3 className="font-semibold text-sm text-gray-700">Exterior & Interior</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exterior_color">Exterior Color</Label>
                <Input id="exterior_color" name="exterior_color" placeholder="e.g., White" />
              </div>
              <div>
                <Label htmlFor="interior_color">Interior Color</Label>
                <Input id="interior_color" name="interior_color" placeholder="e.g., Black" />
              </div>
            </div>
          </div>

          {/* Odometer & Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Mileage & Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mileage">Mileage *</Label>
                <Input id="mileage" name="mileage" type="number" required min="0" />
              </div>
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input id="price" name="price" type="number" required min="0" step="1" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Vehicle Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the vehicle's condition, features, and any important details..."
            />
          </div>

          {/* Images */}
          <div>
            <Label>Vehicle Images (Recommended: 5-10 images)</Label>
            <ImageUploadZone images={images} onImagesChange={setImages} />
            {images.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {images.length} image{images.length !== 1 ? "s" : ""} ready to upload
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadProgress || "Processing..."}
              </span>
            ) : (
              "Add Vehicle"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
