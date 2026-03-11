import { NextRequest } from "next/server";
import { createAuthClient, requireAuth, errorResponse, successResponse } from "../../../../lib/api-helpers";

// GET /api/properties/[id] - Get single property with stats
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase } = await createAuthClient();

  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      agents!properties_agent_id_fkey(id, name, avatar, brokerage, rating, years_exp, homes_sold_ytd, specialties),
      neighborhoods!properties_neighborhood_id_fkey(id, name, city, vibe_scores, description)
    `)
    .eq("id", id)
    .single();

  if (error) return errorResponse("Property not found", 404);

  // Get engagement counts
  const [likes, comments, saves] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact" }).eq("property_id", id),
    supabase.from("comments").select("id", { count: "exact" }).eq("property_id", id),
    supabase.from("saves").select("id", { count: "exact" }).eq("property_id", id),
  ]);

  return successResponse({
    ...data,
    like_count: likes.count || 0,
    comment_count: comments.count || 0,
    save_count: saves.count || 0,
  });
}

// PATCH /api/properties/[id] - Update a property
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (!profile || !["admin", "agent"].includes(profile.role)) {
    return errorResponse("Forbidden", 403);
  }

  const body = await request.json();

  // Only allow specific fields to be updated
  const allowedFields = [
    "address", "city", "state", "zip", "price", "beds", "baths", "sqft",
    "lot_size", "year_built", "property_type", "status", "images", "description",
    "tags", "match_score", "days_on_market"
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("properties")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  return successResponse(data);
}

// DELETE /api/properties/[id] - Delete a property
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return errorResponse("Only admins can delete listings", 403);
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) return errorResponse(error.message, 500);
  return successResponse({ deleted: true });
}
