import { NextRequest } from "next/server";
import { requireAuth, errorResponse, successResponse } from "../../../../../lib/api-helpers";

// POST /api/boards/[id]/properties - Add property to board
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boardId } = await params;
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();

  if (!body.property_id) {
    return errorResponse("property_id is required");
  }

  // Verify board ownership
  const { data: board } = await supabase
    .from("boards")
    .select("id")
    .eq("id", boardId)
    .eq("user_id", user!.id)
    .single();

  if (!board) return errorResponse("Board not found", 404);

  // Check if already added
  const { data: existing } = await supabase
    .from("board_properties")
    .select("id")
    .eq("board_id", boardId)
    .eq("property_id", body.property_id)
    .maybeSingle();

  if (existing) return successResponse({ message: "Already in board" });

  const { error } = await supabase.from("board_properties").insert({
    board_id: boardId,
    property_id: body.property_id,
  });

  if (error) return errorResponse(error.message, 500);
  return successResponse({ added: true }, 201);
}

// DELETE /api/boards/[id]/properties - Remove property from board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boardId } = await params;
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("property_id");

  if (!propertyId) return errorResponse("property_id query param is required");

  // Verify board ownership
  const { data: board } = await supabase
    .from("boards")
    .select("id")
    .eq("id", boardId)
    .eq("user_id", user!.id)
    .single();

  if (!board) return errorResponse("Board not found", 404);

  const { error } = await supabase
    .from("board_properties")
    .delete()
    .eq("board_id", boardId)
    .eq("property_id", propertyId);

  if (error) return errorResponse(error.message, 500);
  return successResponse({ removed: true });
}
