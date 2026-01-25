"use server"

import {
  addVehicleToStore,
  deleteVehicleFromStore,
  getAllVehicles,
  updateVehicleInStore,
  Vehicle
} from "@/lib/store"
import { revalidatePath } from "next/cache"
import {
  sanitizeString,
  sanitizeImageUrls,
  sanitizeYear,
  sanitizeNumber,
  sanitizeVIN
} from "@/lib/sanitize"

export async function getVehicles() {
  try {
    const vehicles = await getAllVehicles();
    return { success: true, vehicles }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load vehicles", vehicles: [] }
  }
}

export async function uploadSingleVehicleImage(vehicleId: string, imageData: { url: string; order: number }) {
  try {
    const vehicles = await getAllVehicles();
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    if (!imageData.url) {
      return { success: false, error: "No image URL provided" }
    }

    // Initialize images array if it doesn't exist
    if (!vehicle.images) {
      vehicle.images = [];
    }

    // Add image
    // Note: We're not handling 'display_order' strictly as a separate field in the simple JSON model 
    // unless we change the model. We'll simply append or insert. 
    // But since the UI sends order, we can try to respect it or just push.
    // The simple store uses string[] for images. 
    // If we want to support reordering, we should probably update the Vehicle interface to support complex image objects 
    // OR just rely on the array order. 
    // For simplicity in this recreation, we assume the client sends images in order or we just append.

    // Check if we need to update the images array logic. 
    // The previous implementation used a separate table.
    // The store interface has `images: string[]`.

    const newImages = [...vehicle.images];
    // Attempt to place at index if possible, otherwise push
    if (imageData.order >= 0 && imageData.order < newImages.length) {
      newImages.splice(imageData.order, 0, imageData.url);
    } else {
      newImages.push(imageData.url);
    }

    await updateVehicleInStore(vehicleId, { images: newImages });

    return { success: true }
  } catch (err) {
    return { success: false, error: "Failed to upload image" }
  }
}

export async function addVehicle(formData: FormData) {
  try {
    // Parse and sanitize images if provided (Atomic Save)
    const imagesJson = formData.get("images") as string
    let images: string[] = []
    if (imagesJson) {
      try {
        const parsed = JSON.parse(imagesJson)
        if (Array.isArray(parsed)) {
          // Sanitize image URLs to prevent XSS via data: URLs
          images = sanitizeImageUrls(parsed)
        }
      } catch (e) {
        console.error("Failed to parse images JSON", e)
      }
    }

    // Sanitize all string inputs
    const make = sanitizeString(formData.get("make") as string)
    const model = sanitizeString(formData.get("model") as string)
    const trim = sanitizeString(formData.get("trim") as string) || null
    const description = sanitizeString(formData.get("description") as string) || null
    const transmission = sanitizeString(formData.get("transmission") as string) || "Automatic"
    const titleStatus = sanitizeString(formData.get("title_status") as string) || "Clean"

    // Validate required fields
    if (!make || !model) {
      return { success: false, error: "Make and Model are required" }
    }

    const vehicleData: any = {
      id: crypto.randomUUID(),
      year: sanitizeYear(formData.get("year") as string),
      make,
      model,
      trim,
      price: sanitizeNumber(formData.get("price") as string, 0, 10000000),
      mileage: Math.floor(sanitizeNumber(formData.get("mileage") as string, 0, 1000000)),
      transmission,
      description,
      status: "available",
      title_status: titleStatus,
      created_at: new Date().toISOString(),
      images,
    }

    // Handle optional fields with sanitization
    const optionalStringFields = [
      "stock_number",
      "body_style",
      "condition",
      "engine",
      "drivetrain",
      "fuel_type",
      "exterior_color",
      "interior_color",
    ]

    optionalStringFields.forEach((field) => {
      const value = formData.get(field) as string
      if (value && value.trim()) {
        vehicleData[field] = sanitizeString(value)
      }
    })

    // Special handling for VIN
    const vin = formData.get("vin") as string
    if (vin && vin.trim()) {
      vehicleData.vin = sanitizeVIN(vin)
    }

    const newVehicle = await addVehicleToStore(vehicleData as Vehicle);

    try {
      revalidatePath("/admin")
      revalidatePath("/")
    } catch (e) {
      console.warn("Revalidation failed (non-critical):", e)
    }
    return { success: true, vehicleId: newVehicle.id }
  } catch (err) {
    console.error(err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to create vehicle" }
  }
}

export async function deleteVehicle(id: string) {
  try {
    await deleteVehicleFromStore(id);
    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete vehicle" }
  }
}

export async function updateVehicleStatus(id: string, status: string) {
  try {
    await updateVehicleInStore(id, { status });
    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update status" }
  }
}

export async function updateVehicle(id: string, formData: FormData) {
  try {
    // Sanitize and validate required fields
    const make = sanitizeString(formData.get("make") as string)
    const model = sanitizeString(formData.get("model") as string)
    const year = formData.get("year")
    const price = formData.get("price")
    const mileage = formData.get("mileage")

    if (!year || !make || !model || !price || !mileage) {
      return { success: false, error: "Missing required fields" }
    }

    // Build update object with sanitization
    const vehicleData: Record<string, any> = {
      year: sanitizeYear(year as string),
      make,
      model,
      trim: sanitizeString(formData.get("trim") as string) || null,
      price: sanitizeNumber(price as string, 0, 10000000),
      mileage: Math.floor(sanitizeNumber(mileage as string, 0, 1000000)),
      transmission: sanitizeString(formData.get("transmission") as string) || "Automatic",
      description: sanitizeString(formData.get("description") as string) || null,
      title_status: sanitizeString(formData.get("title_status") as string) || "Clean",
    }

    // Add optional fields with sanitization
    const optionalFields = [
      "stock_number",
      "body_style",
      "condition",
      "engine",
      "drivetrain",
      "fuel_type",
      "exterior_color",
      "interior_color",
    ]

    for (const field of optionalFields) {
      const value = formData.get(field) as string
      vehicleData[field] = value ? sanitizeString(value) : null
    }

    // Special handling for VIN
    const vin = formData.get("vin") as string
    vehicleData.vin = vin ? sanitizeVIN(vin) : null

    await updateVehicleInStore(id, vehicleData);

    // Revalidate cache
    try {
      revalidatePath("/admin")
      revalidatePath("/")
    } catch (e) {
      console.warn("Revalidation failed:", e)
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Update failed" }
  }
}

export async function updateVehicleImages(
  vehicleId: string,
  existingImageUrls: string[],
  newImages: Array<{ url: string; order: number }>,
) {
  try {
    // Combine existing and new images
    // In our simple string[] model, we just concat them.
    // Ideally we should respect the order passed in `newImages` relative to `existingImageUrls`.
    // But since the UI usually appends, we'll just reconstruct the list.

    // Actually, the `existingImageUrls` passed from the client might be the *new* state of existing images (reordered/deleted).
    // So we should trust `existingImageUrls` and append `newImages`.

    // Sort newImages by order
    const sortedNew = [...newImages].sort((a, b) => a.order - b.order).map(i => i.url);

    const finalImages = [...existingImageUrls, ...sortedNew];

    await updateVehicleInStore(vehicleId, { images: finalImages });

    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Image update failed" }
  }
}
