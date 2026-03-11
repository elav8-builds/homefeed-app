import { NextRequest } from "next/server";
import { requireAuth, errorResponse, successResponse } from "../../../lib/api-helpers";

// GET /api/profile - Get current user's profile with stats
export async function GET() {
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (error) return errorResponse("Profile not found", 404);

  // Get stats
  const [likes, saves, follows, boards] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact" }).eq("user_id", user!.id),
    supabase.from("saves").select("id", { count: "exact" }).eq("user_id", user!.id),
    supabase.from("follows").select("id", { count: "exact" }).eq("user_id", user!.id),
    supabase.from("boards").select("id", { count: "exact" }).eq("user_id", user!.id),
  ]);

  return successResponse({
    ...profile,
    stats: {
      liked: likes.count || 0,
      saved: saves.count || 0,
      following: follows.count || 0,
      boards: boards.count || 0,
    },
  });
}

// PATCH /api/profile - Update user's profile
export async function PATCH(request: NextRequest) {
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();

  const allowedFields = ["full_name", "avatar_url", "bio", "vibe_profile"];
  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user!.id)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  return successResponse(data);
}
