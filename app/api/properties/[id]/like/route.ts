import { NextRequest } from "next/server";
import { requireAuth, errorResponse, successResponse } from "../../../../../lib/api-helpers";

// POST /api/properties/[id]/like - Toggle like
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  // Check if already liked
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user!.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing) {
    // Unlike
    await supabase.from("likes").delete().eq("id", existing.id);
    return successResponse({ liked: false });
  } else {
    // Like
    const { error } = await supabase.from("likes").insert({
      user_id: user!.id,
      property_id: propertyId,
    });
    if (error) return errorResponse(error.message, 500);
    return successResponse({ liked: true });
  }
}
