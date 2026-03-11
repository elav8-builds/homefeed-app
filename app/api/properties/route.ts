import { NextRequest, NextResponse } from "next/server";
import { createAuthClient, requireAuth, errorResponse, successResponse, validateRequired } from "../../../lib/api-helpers";

// GET /api/properties - List properties with filters
export async function GET(request: NextRequest) {
  const { supabase } = await createAuthClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  const sort = searchParams.get("sort") || "recommended"; // recommended | newest | popular
  const status = searchParams.get("status") || "active";
  const type = searchParams.get("type"); // single_family | condo | etc.
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const beds = searchParams.get("beds");
  const neighborhood = searchParams.get("neighborhood");
  const search = searchParams.get("search");

  let query = supabase
    .from("properties")
    .select("*, agents!properties_agent_id_fkey(id, name, avatar, brokerage, rating)", { count: "exact" });

  // Filters
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("property_type", type);
  if (minPrice) query = query.gte("price", parseInt(minPrice));
  if (maxPrice) query = query.lte("price", parseInt(maxPrice));
  if (beds) query = query.gte("beds", parseInt(beds));
  if (neighborhood) query = query.eq("neighborhood_id", neighborhood);
  if (search) query = query.or(`address.ilike.%${search}%,city.ilike.%${search}%,description.ilike.%${search}%`);

  // Sorting
  if (sort === "newest") {
    query = query.order("list_date", { ascending: false });
  } else if (sort === "popular") {
    query = query.order("match_score", { ascending: false }); // Will use like_count once we add a view
  } else {
    query = query.order("match_score", { ascending: false });
  }

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return errorResponse(error.message, 500);

  return successResponse({
    properties: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

// POST /api/properties - Create a new property (admin/agent only)
export async function POST(request: NextRequest) {
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();

  const validationError = validateRequired(body, [
    "address", "city", "state", "zip", "price", "beds", "baths", "sqft", "year_built", "agent_id", "neighborhood_id"
  ]);
  if (validationError) return errorResponse(validationError);

  // Check role (must be admin or agent)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (!profile || !["admin", "agent"].includes(profile.role)) {
    return errorResponse("Only admins and agents can create listings", 403);
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({
      address: body.address,
      city: body.city,
      state: body.state,
      zip: body.zip,
      price: body.price,
      beds: body.beds,
      baths: body.baths,
      sqft: body.sqft,
      lot_size: body.lot_size || 0,
      year_built: body.year_built,
      property_type: body.property_type || "single_family",
      status: body.status || "active",
      images: body.images || [],
      description: body.description || "",
      tags: body.tags || [],
      agent_id: body.agent_id,
      neighborhood_id: body.neighborhood_id,
      match_score: body.match_score || 85,
      days_on_market: body.days_on_market || 0,
    })
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  return successResponse(data, 201);
}
