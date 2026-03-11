"use client";

import { useState } from "react";
import PropertyCard from "./PropertyCard";
import { properties } from "../data/properties";
import { neighborhoods } from "../data/neighborhoods";
import { useApp } from "../hooks/useApp";

export default function Explore() {
  const { selectNeighborhood } = useApp();
  const [view, setView] = useState<"map" | "neighborhoods">("neighborhoods");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(2000000);
  const [beds, setBeds] = useState(0);
  const [propertyType, setPropertyType] = useState("all");

  const filtered = properties.filter(p => {
    if (p.price < priceMin || p.price > priceMax) return false;
    if (beds > 0 && p.beds < beds) return false;
    if (propertyType !== "all" && p.propertyType !== propertyType) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white mb-3">Explore</h1>

        {/* View toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setView("neighborhoods")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              view === "neighborhoods" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "glass text-slate-400"
            }`}
          >
            🏘️ Neighborhoods
          </button>
          <button
            onClick={() => setView("map")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              view === "map" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "glass text-slate-400"
            }`}
          >
            🗺️ Search
          </button>
        </div>

        {/* Filters (search view only) */}
        {view === "map" && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <select value={`${priceMin}-${priceMax}`} onChange={e => {
              const [min, max] = e.target.value.split("-").map(Number);
              setPriceMin(min);
              setPriceMax(max);
            }} className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 outline-none whitespace-nowrap">
              <option value="0-2000000">Any Price</option>
              <option value="0-500000">Under $500K</option>
              <option value="500000-750000">$500K-$750K</option>
              <option value="750000-1000000">$750K-$1M</option>
              <option value="1000000-2000000">$1M+</option>
            </select>
            <select value={beds} onChange={e => setBeds(Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 outline-none whitespace-nowrap">
              <option value={0}>Any Beds</option>
              <option value={2}>2+ Beds</option>
              <option value={3}>3+ Beds</option>
              <option value={4}>4+ Beds</option>
            </select>
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 outline-none whitespace-nowrap">
              <option value="all">All Types</option>
              <option value="single_family">Single Family</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {view === "neighborhoods" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 mb-2">Popular neighborhoods in Austin, TX</p>
            {neighborhoods.map(hood => (
              <div
                key={hood.id}
                className="glass rounded-2xl p-4 cursor-pointer hover:bg-white/[0.08] transition-all"
                onClick={() => selectNeighborhood(hood.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{hood.name}</h3>
                    <p className="text-xs text-slate-500">{hood.city}, {hood.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${(hood.medianPrice / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-emerald-400">{hood.priceChangeYoY} YoY</p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="glass rounded-lg px-2 py-1 text-slate-300">{hood.activeListings} listings</span>
                  <span className="glass rounded-lg px-2 py-1 text-slate-300">{hood.followerCount.toLocaleString()} followers</span>
                  <span className="glass rounded-lg px-2 py-1 text-slate-300">Walk: {hood.vibeScores.walkability}/10</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400 mb-3">{filtered.length} listings found</p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(p => (
                <PropertyCard key={p.id} propertyId={p.id} compact />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">🏠</p>
                <p className="text-slate-400">No listings match your filters</p>
                <p className="text-sm text-slate-600 mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
