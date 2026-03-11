import { NextRequest } from "next/server";
import { requireAuth, errorResponse, successResponse } from "../../../lib/api-helpers";

// POST /api/follows - Toggle follow for agent or neighborhood
export async function POST(request: NextRequest) {
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();

  if (!body.target_type || !["agent", "neighborhood"].includes(body.target_type)) {
    return errorResponse("target_type must be 'agent' or 'neighborhood'");
  }
  if (!body.target_id) {
    return errorResponse("target_id is required");
  }

  // Check if already following
  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("user_id", user!.id)
    .eq("target_type", body.target_type)
    .eq("target_id", body.target_id)
    .maybeSingle();

  if (existing) {
    // Unfollow
    await supabase.from("follows").delete().eq("id", existing.id);
    return successResponse({ following: false });
  } else {
    // Follow
    const { error } = await supabase.from("follows").insert({
      user_id: user!.id,
      target_type: body.target_type,
      target_id: body.target_id,
    });
    if (error) return errorResponse(error.message, 500);
    return successResponse({ following: true });
  }
}

// GET /api/follows - Get user's follows
export async function GET(request: NextRequest) {
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("type"); // agent | neighborhood

  let query = supabase
    .from("follows")
    .select("*")
    .eq("user_id", user!.id);

  if (targetType) query = query.eq("target_type", targetType);

  const { data, error } = await query;

  if (error) return errorResponse(error.message, 500);
  return successResponse(data);
}
