"use client";

import { useApp } from "../hooks/useApp";
import { neighborhoods } from "../data/neighborhoods";
import { properties } from "../data/properties";
import PropertyCard from "./PropertyCard";

interface Props {
  neighborhoodId: string;
  onBack: () => void;
}

export default function NeighborhoodDetail({ neighborhoodId, onBack }: Props) {
  const hood = neighborhoods.find(n => n.id === neighborhoodId);
  const { followedNeighborhoods, toggleFollowNeighborhood } = useApp();

  if (!hood) return <div className="p-4 text-slate-400">Neighborhood not found</div>;

  const isFollowed = followedNeighborhoods.has(hood.id);
  const hoodProperties = properties.filter(p => p.neighborhoodId === hood.id);

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-lg">←</button>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{hood.name}</p>
          <p className="text-xs text-slate-500">{hood.city}, {hood.state}</p>
        </div>
        <button
          onClick={() => toggleFollowNeighborhood(hood.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isFollowed ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "glass text-slate-400"
          }`}
        >
          {isFollowed ? "✓ Following" : "+ Follow"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">${(hood.medianPrice / 1000).toFixed(0)}K</p>
            <p className="text-xs text-slate-500">Median Price</p>
            <p className="text-xs text-emerald-400">{hood.priceChangeYoY} YoY</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{hood.avgDaysOnMarket}</p>
            <p className="text-xs text-slate-500">Avg Days on Market</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{hood.activeListings}</p>
            <p className="text-xs text-slate-500">Active Listings</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{hood.followerCount.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Followers</p>
          </div>
        </div>

        {/* Vibe Scores */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">🎯 Vibe Scores</h3>
          <div className="space-y-3">
            {Object.entries(hood.vibeScores).map(([key, score]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-24 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                <div className="flex-1 score-bar"><div className="score-bar-fill" style={{ width: `${(score as number) * 10}%` }} /></div>
                <span className="text-xs text-slate-400 w-8 text-right">{score as number}/10</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-2">About {hood.name}</h3>
          <p className="text-sm text-slate-400">{hood.description}</p>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">⭐ Resident Reviews</h3>
          <div className="space-y-3">
            {hood.reviews.map(review => (
              <div key={review.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{review.userName}</p>
                    <p className="text-[10px] text-slate-500">Resident for {review.yearsLived} years</p>
                  </div>
                  <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < review.rating ? "text-amber-400" : "text-slate-700"}>★</span>
                  ))}</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <p className="text-[10px] text-slate-600 mt-2">👍 {review.helpful} found this helpful</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active listings */}
        {hoodProperties.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-white mb-3">🏠 Active Listings ({hoodProperties.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {hoodProperties.map(p => (
                <PropertyCard key={p.id} propertyId={p.id} compact />
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
