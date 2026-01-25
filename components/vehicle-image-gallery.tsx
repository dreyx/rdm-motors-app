"use client"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface VehicleImageGalleryProps {
  images: string[]
  vehicleName: string
}

export function VehicleImageGallery({ images, vehicleName }: VehicleImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return

      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      } else if (e.key === "Escape") {
        setIsLightboxOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, images.length, isLightboxOpen])

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isLightboxOpen])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const handleImageClick = () => {
    setIsLightboxOpen(true)
  }

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <svg className="mx-auto h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p>No images available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image - Click to Open Lightbox */}
        <div
          className="relative aspect-video bg-neutral-950 rounded-2xl overflow-hidden group cursor-pointer shadow-inner border border-white/5"
          onClick={handleImageClick}
        >
          {images[currentIndex] ? (
            <Image
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`${vehicleName} - Image ${currentIndex + 1}`}
              fill
              className="object-contain p-2 group-hover:scale-[1.02] transition-transform duration-700 ease-in-out"
              quality={95}
              priority
            />
          ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
              <svg className="h-12 w-12 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          {/* Image Counter */}
          <div className="absolute bottom-6 left-6 bg-black/80 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 z-10">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Click to View Hint */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100 bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
              View Full Gallery
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-black/40 hover:bg-brand-red text-white opacity-0 group-hover:opacity-100 transition-all h-12 w-12 rounded-full backdrop-blur-md border border-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-black/40 hover:bg-brand-red text-white opacity-0 group-hover:opacity-100 transition-all h-12 w-12 rounded-full backdrop-blur-md border border-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide justify-center">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  goToImage(index)
                  setIsLightboxOpen(true) // Open lightbox immediately on thumbnail click as requested
                }}
                className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${index === currentIndex
                  ? "border-brand-red scale-105 shadow-lg"
                  : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                aria-label={`View image ${index + 1}`}
              >
                {image ? (
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    width={96}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-gray-light flex items-center justify-center">
                    <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)} // Close when clicking background
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white h-12 w-12 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Image Counter */}
          <div
            className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main Lightbox Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-16">
            <div
              className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking image/container
            >
              {images[currentIndex] ? (
                <Image
                  src={images[currentIndex] || "/placeholder.svg"}
                  alt={`${vehicleName} - Image ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 100vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-400 flex items-center justify-center rounded">
                  <svg className="h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white h-16 w-16 z-20"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-10 w-10" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white h-16 w-16 z-20"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                aria-label="Next image"
              >
                <ChevronRight className="h-10 w-10" />
              </Button>
            </>
          )}

          {/* Thumbnail Strip at Bottom */}
          {images.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-4xl w-full px-4 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                      ? "border-white ring-2 ring-white ring-offset-2 ring-offset-black"
                      : "border-white/30 hover:border-white/60 opacity-60 hover:opacity-100"
                      }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    {image ? (
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                        <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
