import { NextRequest } from "next/server";
import { createAuthClient, requireAuth, errorResponse, successResponse } from "../../../../../lib/api-helpers";

// GET /api/properties/[id]/comments - List comments for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  const { supabase } = await createAuthClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("comments")
    .select(`
      *,
      profiles!comments_user_id_fkey(full_name, avatar_url)
    `, { count: "exact" })
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return errorResponse(error.message, 500);

  return successResponse({
    comments: data?.map(c => ({
      ...c,
      user_name: (c.profiles as { full_name: string | null })?.full_name || "Anonymous",
      user_avatar: (c.profiles as { avatar_url: string | null })?.avatar_url,
    })),
    total: count || 0,
  });
}

// POST /api/properties/[id]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();

  if (!body.text || typeof body.text !== "string" || body.text.trim().length === 0) {
    return errorResponse("Comment text is required");
  }

  if (body.text.length > 2000) {
    return errorResponse("Comment must be under 2000 characters");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: user!.id,
      property_id: propertyId,
      text: body.text.trim(),
      parent_id: body.parent_id || null,
    })
    .select(`
      *,
      profiles!comments_user_id_fkey(full_name, avatar_url)
    `)
    .single();

  if (error) return errorResponse(error.message, 500);

  return successResponse({
    ...data,
    user_name: (data.profiles as { full_name: string | null })?.full_name || "Anonymous",
    user_avatar: (data.profiles as { avatar_url: string | null })?.avatar_url,
  }, 201);
}
