"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { X, GripVertical, Upload, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface ImageItem {
  id: string
  url: string
  uploading?: boolean
  error?: boolean
}

interface ImageUploadZoneProps {
  images: ImageItem[]
  onImagesChange: (images: ImageItem[]) => void
}

function SortableImage({ image, onRemove, images }: { image: ImageItem; onRemove: () => void; images: ImageItem[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-muted rounded-lg overflow-hidden border-2 ${image.error ? "border-red-500" : image.uploading ? "border-yellow-400" : "border-border"
        }`}
    >
      <div className="aspect-video relative">
        {image.url ? (
          <img src={image.url || "/placeholder.svg"} alt="Vehicle" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            {image.uploading ? (
              <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
            ) : image.error ? (
              <AlertCircle className="h-8 w-8 text-red-500" />
            ) : (
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        )}

        {/* Uploading overlay */}
        {image.uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-white text-xs font-medium">Uploading...</div>
          </div>
        )}

        {/* Error overlay */}
        {image.error && (
          <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
            <div className="text-white text-xs font-medium">Failed</div>
          </div>
        )}

        {/* Action buttons - only show when not uploading */}
        {!image.uploading && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8 shadow-lg"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRemove()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing h-8 w-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-100"
              onClick={(e) => e.preventDefault()}
            >
              <GripVertical className="h-4 w-4 text-black" />
            </div>
          </div>
        )}
      </div>
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        #{images.findIndex((img) => img.id === image.id) + 1}
      </div>
    </div>
  )
}

// Upload a single image to the server (which uploads to Cloudinary)
async function uploadImageToCloud(base64Data: string): Promise<string> {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ image: base64Data }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Upload failed")
  }

  const result = await response.json()
  return result.url
}

export function ImageUploadZone({ images, onImagesChange }: ImageUploadZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const compressImage = useCallback(async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d", { alpha: false })

            if (!ctx) {
              resolve(null)
              return
            }

            // Max 1400px for better mobile compatibility
            const maxSize = 1400
            let width = img.width
            let height = img.height

            if (width > maxSize || height > maxSize) {
              const ratio = Math.min(maxSize / width, maxSize / height)
              width = Math.floor(width * ratio)
              height = Math.floor(height * ratio)
            }

            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)

            // Use 70% quality for good balance
            const dataUrl = canvas.toDataURL("image/jpeg", 0.70)

            // Cleanup
            canvas.width = 0
            canvas.height = 0

            resolve(dataUrl)
          } catch {
            resolve(null)
          }
        }

        img.onerror = () => resolve(null)
        img.src = e.target?.result as string
      }

      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }, [])

  const processFiles = useCallback(
    async (files: File[]) => {
      let imageFiles = files.filter((file) => file.type.startsWith("image/"))
      if (imageFiles.length === 0) return

      // Sort files by name to maintain the order the user expects from their folder
      imageFiles = imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

      setIsProcessing(true)

      // Create placeholder items for each image
      const placeholders: ImageItem[] = imageFiles.map((file, index) => ({
        id: `img-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        url: "",
        uploading: true,
      }))

      // Add placeholders immediately so user sees progress
      // We need to track our own copy of the images array for async updates
      let currentImages = [...images, ...placeholders]
      onImagesChange(currentImages)

      // Process and upload each image sequentially
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const placeholderId = placeholders[i].id

        try {
          // Compress the image
          const base64Data = await compressImage(file)

          if (!base64Data) {
            // Mark as failed
            currentImages = currentImages.map((img) =>
              img.id === placeholderId
                ? { ...img, uploading: false, error: true }
                : img
            )
            onImagesChange(currentImages)
            continue
          }

          // Upload to Cloudinary via our API
          const cloudUrl = await uploadImageToCloud(base64Data)

          // Update the placeholder with the real URL
          currentImages = currentImages.map((img) =>
            img.id === placeholderId
              ? { ...img, url: cloudUrl, uploading: false }
              : img
          )
          onImagesChange(currentImages)
        } catch (error) {
          console.error("Failed to upload image:", error)
          // Mark as failed
          currentImages = currentImages.map((img) =>
            img.id === placeholderId
              ? { ...img, uploading: false, error: true }
              : img
          )
          onImagesChange(currentImages)
        }

        // Small delay between uploads to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setIsProcessing(false)
    },
    [images, onImagesChange, compressImage],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOver(false)
      const files = Array.from(e.dataTransfer.files)
      processFiles(files)
    },
    [processFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      processFiles(files)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [processFiles],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const items = e.clipboardData?.items
      if (!items) return

      const files: File[] = []
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile()
          if (blob) files.push(blob)
        }
      }

      if (files.length > 0) {
        processFiles(files)
      }
    },
    [processFiles],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = images.findIndex((img) => img.id === active.id)
        const newIndex = images.findIndex((img) => img.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          onImagesChange(arrayMove(images, oldIndex, newIndex))
        }
      }
    },
    [images, onImagesChange],
  )

  const removeImage = useCallback(
    (id: string) => {
      onImagesChange(images.filter((img) => img.id !== id))
    },
    [images, onImagesChange],
  )

  // Count successfully uploaded images
  const uploadedCount = images.filter((img) => img.url && !img.uploading && !img.error).length
  const uploadingCount = images.filter((img) => img.uploading).length
  const failedCount = images.filter((img) => img.error).length

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        tabIndex={0}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${isDraggingOver
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <div className="space-y-3 flex flex-col items-center">
          <div className={`rounded-full p-3 transition-colors ${isDraggingOver ? "bg-primary/20" : "bg-muted"}`}>
            <Upload className={`h-8 w-8 ${isDraggingOver ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="text-sm font-medium">{isProcessing ? "Processing images..." : "Drag and drop images here"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isProcessing ? "Please wait..." : "or click to browse, or paste from clipboard"}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={isProcessing}
          />
          <Button type="button" variant="outline" size="sm" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Choose Files"}
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {uploadedCount} uploaded
            {uploadingCount > 0 && ` • ${uploadingCount} uploading`}
            {failedCount > 0 && <span className="text-red-500"> • {failedCount} failed</span>}
            {uploadedCount > 0 && " • Drag to reorder"}
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <SortableImage key={image.id} image={image} onRemove={() => removeImage(image.id)} images={images} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
