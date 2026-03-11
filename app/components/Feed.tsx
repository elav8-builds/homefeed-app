"use client";

import { useState } from "react";
import PropertyCard from "./PropertyCard";
import { properties } from "../data/properties";

export default function Feed() {
  const [sortBy, setSortBy] = useState<"recommended" | "newest" | "popular">("recommended");

  const sorted = [...properties].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.listDate).getTime() - new Date(a.listDate).getTime();
    if (sortBy === "popular") return b.likeCount - a.likeCount;
    return b.matchScore - a.matchScore;
  });

  return (
    <div className="h-full flex flex-col">
      {/* App header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">
          Home<span className="text-indigo-400">Feed</span>
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 outline-none"
          >
            <option value="recommended">🎯 For You</option>
            <option value="newest">🆕 Newest</option>
            <option value="popular">🔥 Popular</option>
          </select>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map(property => (
          <PropertyCard key={property.id} propertyId={property.id} />
        ))}
        <div className="py-8 text-center text-sm text-slate-600">
          You&apos;ve seen all {properties.length} listings ✨
        </div>
      </div>
    </div>
  );
}
