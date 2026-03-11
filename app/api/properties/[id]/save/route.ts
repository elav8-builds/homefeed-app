import { NextRequest } from "next/server";
import { requireAuth, errorResponse, successResponse } from "../../../../../lib/api-helpers";

// POST /api/properties/[id]/save - Toggle save
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  // Check if already saved
  const { data: existing } = await supabase
    .from("saves")
    .select("id")
    .eq("user_id", user!.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing) {
    // Unsave
    await supabase.from("saves").delete().eq("id", existing.id);
    return successResponse({ saved: false });
  } else {
    // Save
    const { error } = await supabase.from("saves").insert({
      user_id: user!.id,
      property_id: propertyId,
    });
    if (error) return errorResponse(error.message, 500);
    return successResponse({ saved: true });
  }
}
