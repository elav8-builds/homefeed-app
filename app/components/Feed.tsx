"use client";

import { useState } from "react";
import PropertyCard from "./PropertyCard";
import { properties } from "../data/properties";
import { useAuth } from "../hooks/useAuth";

export default function Feed() {
  const [sortBy, setSortBy] = useState<"recommended" | "newest" | "popular">("recommended");
  const { user, isDemo } = useAuth();

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
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 outline-none cursor-pointer"
          >
            <option value="recommended">🎯 For You</option>
            <option value="newest">🆕 Newest</option>
            <option value="popular">🔥 Popular</option>
          </select>
          <button className="relative text-xl text-slate-400 hover:text-white transition-colors">
            🔔
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">3</span>
          </button>
        </div>
      </div>

      {/* Demo mode banner */}
      {isDemo && (
        <div className="px-4 py-2 bg-indigo-500/10 border-b border-indigo-500/20">
          <div className="flex items-center justify-between">
            <p className="text-xs text-indigo-300">
              👋 Browsing as guest — <span className="text-indigo-200">your likes & saves won&apos;t be saved</span>
            </p>
            <a href="/login" className="text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
              Sign in
            </a>
          </div>
        </div>
      )}

      {/* Connected user indicator */}
      {user && !isDemo && (
        <div className="px-4 py-1.5 bg-emerald-500/5 border-b border-emerald-500/10">
          <p className="text-[10px] text-emerald-400/70">
            ✓ Connected as {user.email} — data synced
          </p>
        </div>
      )}

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
