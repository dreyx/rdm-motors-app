"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addVehicle } from "@/app/actions/vehicles"
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
  const [failedFields, setFailedFields] = useState<Set<string>>(new Set())
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatusMessage(null)
    setFailedFields(new Set())

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

    if (images.length < 1) {
      newFailedFields.add("images")
    }

    if (newFailedFields.size > 0) {
      setFailedFields(newFailedFields)
      setStatusMessage({ type: "error", message: "Please fill in all highlighted fields." })

      // Scroll to first error
      // Prioritize images if it's the only one, or general fields
      if (newFailedFields.has("year")) scrollToField("year")
      else if (newFailedFields.has("make")) scrollToField("make")
      else if (newFailedFields.has("model")) scrollToField("model")
      else if (newFailedFields.has("mileage")) scrollToField("mileage")
      else if (newFailedFields.has("price")) scrollToField("price")
      else if (newFailedFields.has("title_status")) scrollToField("title_status")
      else if (newFailedFields.has("images")) {
        const zone = document.getElementById("image-upload-zone")
        if (zone) zone.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    setIsSubmitting(true)

    // Add images to form data as JSON
    // We only need the URLs
    const imageUrls = images.map(img => img.url);
    formData.append("images", JSON.stringify(imageUrls));

    try {
      const result = await addVehicle(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create vehicle")
      }

      setStatusMessage({
        type: "success",
        message: `Vehicle added successfully with ${images.length} images!`,
      })

      // Reset form
      e.currentTarget.reset()
      setImages([])
      setFailedFields(new Set())
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }

      // Clear success message after 5 seconds
      setTimeout(() => setStatusMessage(null), 5000)
    } catch (error) {
      console.error("Submission error:", error)
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Network error. Please check your connection.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToField = (name: string) => {
    // Try to find by name (input) or id (select trigger usually has id same as label context)
    // For shadcn Select, we might need to target the Trigger button.
    // In our form, we gave SelectTrigger an ID for 'year', but maybe not others.
    // Let's try by name first.
    const element = document.getElementsByName(name)[0]
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.focus()
      return
    }
    // Try ID
    const byId = document.getElementById(name)
    if (byId) {
      byId.scrollIntoView({ behavior: "smooth", block: "center" })
      byId.focus()
    }
  }

  const getErrorClass = (name: string) => {
    return failedFields.has(name) ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Vehicle</CardTitle>
        {statusMessage && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${statusMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
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
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Vehicle Identity */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Vehicle Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year" className={failedFields.has("year") ? "text-red-500" : ""}>Year *</Label>
                <Select name="year" defaultValue={new Date().getFullYear().toString()}>
                  <SelectTrigger id="year" className={getErrorClass("year")}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    {Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() + 1 - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="make" className={failedFields.has("make") ? "text-red-500" : ""}>Make *</Label>
                <Input id="make" name="make" className={getErrorClass("make")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model" className={failedFields.has("model") ? "text-red-500" : ""}>Model *</Label>
                <Input id="model" name="model" className={getErrorClass("model")} />
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
                  <SelectContent position="item-aligned">
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
                  <SelectContent position="item-aligned">
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Certified">Certified Pre-Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title_status" className={failedFields.has("title_status") ? "text-red-500" : ""}>Title *</Label>
              <Select name="title_status">
                <SelectTrigger id="title_status" className={getErrorClass("title_status")}>
                  <SelectValue placeholder="Select title status" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
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
                  <SelectContent position="item-aligned">
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
                  <SelectContent position="item-aligned">
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
                  <SelectContent position="item-aligned">
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
                <Label htmlFor="mileage" className={failedFields.has("mileage") ? "text-red-500" : ""}>Mileage *</Label>
                <Input id="mileage" name="mileage" type="number" min="0" className={getErrorClass("mileage")} />
              </div>
              <div>
                <Label htmlFor="price" className={failedFields.has("price") ? "text-red-500" : ""}>Price *</Label>
                <Input id="price" name="price" type="number" min="0" step="1" className={getErrorClass("price")} />
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
          <div id="image-upload-zone" className={failedFields.has("images") ? "p-1 border border-red-500 rounded-lg" : ""}>
            <Label className={failedFields.has("images") ? "text-red-500" : ""}>Vehicle Images (Recommended: 5-10 images) *</Label>
            <ImageUploadZone images={images} onImagesChange={setImages} />
            {images.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {images.length} image{images.length !== 1 ? "s" : ""} included
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Vehicle...
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
