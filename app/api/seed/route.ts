import { NextRequest } from "next/server";
import { requireAuth, errorResponse, successResponse } from "../../../lib/api-helpers";
import { properties } from "../../data/properties";
import { agents } from "../../data/agents";
import { neighborhoods } from "../../data/neighborhoods";

// POST /api/seed - Seed the database with demo data (admin only)
export async function POST(_request: NextRequest) {
  const { supabase, user, response } = await requireAuth();
  if (response) return response;

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return errorResponse("Only admins can seed data", 403);
  }

  const results: string[] = [];

  // Seed neighborhoods
  const neighborhoodData = neighborhoods.map(n => ({
    id: n.id,
    name: n.name,
    city: n.city,
    state: n.state,
    median_price: n.medianPrice,
    price_change_yoy: n.priceChangeYoY,
    avg_days_on_market: n.avgDaysOnMarket,
    active_listings: n.activeListings,
    resident_count: n.residentCount,
    vibe_scores: n.vibeScores,
    description: n.description,
  }));

  const { error: nError } = await supabase
    .from("neighborhoods")
    .upsert(neighborhoodData, { onConflict: "id" });

  results.push(nError ? `Neighborhoods: Error - ${nError.message}` : `Neighborhoods: ${neighborhoodData.length} seeded`);

  // Seed agents
  const agentData = agents.map(a => ({
    id: a.id,
    name: a.name,
    avatar: a.avatar,
    brokerage: a.brokerage,
    years_exp: a.yearsExp,
    license_number: a.licenseNumber,
    homes_sold_ytd: a.homesSoldYtd,
    avg_days_to_close: a.avgDaysToClose,
    avg_sale_vs_list: a.avgSaleVsList,
    rating: a.rating,
    review_count: a.reviewCount,
    specialties: a.specialties,
    neighborhoods: a.neighborhoods,
    bio: a.bio,
  }));

  const { error: aError } = await supabase
    .from("agents")
    .upsert(agentData, { onConflict: "id" });

  results.push(aError ? `Agents: Error - ${aError.message}` : `Agents: ${agentData.length} seeded`);

  // Seed properties
  const propertyData = properties.map(p => ({
    id: p.id,
    address: p.address,
    city: p.city,
    state: p.state,
    zip: p.zip,
    price: p.price,
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft,
    lot_size: p.lotSize,
    year_built: p.yearBuilt,
    property_type: p.propertyType,
    status: p.status,
    images: p.images,
    description: p.description,
    tags: p.tags,
    agent_id: p.agentId,
    neighborhood_id: p.neighborhoodId,
    match_score: p.matchScore,
    days_on_market: p.daysOnMarket,
    list_date: p.listDate,
  }));

  const { error: pError } = await supabase
    .from("properties")
    .upsert(propertyData, { onConflict: "id" });

  results.push(pError ? `Properties: Error - ${pError.message}` : `Properties: ${propertyData.length} seeded`);

  return successResponse({ results });
}
