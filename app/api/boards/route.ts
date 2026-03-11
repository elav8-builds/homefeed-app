import { NextRequest } from "next/server";
import { requireAuth, errorResponse, successResponse } from "../../../lib/api-helpers";

// GET /api/boards - List user's boards
export async function GET() {
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const { data, error } = await supabase
    .from("boards")
    .select(`
      *,
      board_properties(property_id, properties(id, images, price, address, city))
    `)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (error) return errorResponse(error.message, 500);

  return successResponse(data?.map(board => ({
    ...board,
    property_count: board.board_properties?.length || 0,
    cover_image: board.board_properties?.[0]?.properties
      ? (board.board_properties[0].properties as { images: string[] }).images?.[0]
      : null,
  })));
}

// POST /api/boards - Create a new board
export async function POST(request: NextRequest) {
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();

  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return errorResponse("Board name is required");
  }

  const { data, error } = await supabase
    .from("boards")
    .insert({
      user_id: user!.id,
      name: body.name.trim(),
      description: body.description || null,
      is_public: body.is_public || false,
    })
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  return successResponse(data, 201);
}
