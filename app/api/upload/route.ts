import { NextRequest } from "next/server";
import { requireAuth, errorResponse, successResponse } from "../../../lib/api-helpers";

// POST /api/upload - Upload an image to Supabase Storage
export async function POST(request: NextRequest) {
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return errorResponse("No file provided");
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedTypes.includes(file.type)) {
    return errorResponse("Only JPEG, PNG, WebP, and HEIC images are allowed");
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return errorResponse("File must be under 10MB");
  }

  // Generate unique filename
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("property-images")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) return errorResponse(error.message, 500);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("property-images")
    .getPublicUrl(data.path);

  return successResponse({
    url: urlData.publicUrl,
    path: data.path,
  }, 201);
}
