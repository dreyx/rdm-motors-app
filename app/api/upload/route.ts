import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Cloudinary unsigned upload endpoint
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function POST(request: NextRequest) {
    try {
        // Verify admin session
        const cookieStore = await cookies();
        const adminSession = cookieStore.get("admin-session");

        if (!adminSession?.value) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            return NextResponse.json(
                { error: "Image upload not configured. Please set CLOUDINARY environment variables." },
                { status: 500 }
            );
        }

        // Get the image data from request
        const body = await request.json();
        const { image } = body; // base64 data URL

        if (!image || !image.startsWith("data:image/")) {
            return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
        }

        // Upload to Cloudinary
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "rdm-motors"); // Organize uploads in a folder

        const uploadResponse = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error("Cloudinary upload failed:", errorText);
            return NextResponse.json(
                { error: "Failed to upload image to cloud storage" },
                { status: 500 }
            );
        }

        const uploadResult = await uploadResponse.json();

        return NextResponse.json({
            success: true,
            url: uploadResult.secure_url,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to process image upload" },
            { status: 500 }
        );
    }
}
