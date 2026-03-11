"use client";

import { useState, useRef } from "react";
import { useApp } from "../hooks/useApp";
import { properties } from "../data/properties";
import { agents } from "../data/agents";

interface PropertyCardProps {
  propertyId: string;
  compact?: boolean;
}

export default function PropertyCard({ propertyId, compact }: PropertyCardProps) {
  const property = properties.find(p => p.id === propertyId);
  const agent = property ? agents.find(a => a.id === property.agentId) : null;
  const { likedProperties, savedProperties, toggleLike, toggleSave, selectProperty, selectAgent } = useApp();
  const [currentImage, setCurrentImage] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  if (!property) return null;

  const isLiked = likedProperties.has(property.id);
  const isSaved = savedProperties.has(property.id);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) toggleLike(property.id);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 600);
    }
    lastTapRef.current = now;
  };

  const nextImage = () => setCurrentImage(i => (i + 1) % property.images.length);
  const prevImage = () => setCurrentImage(i => (i - 1 + property.images.length) % property.images.length);

  const formatPrice = (p: number) => {
    if (p >= 1000000) return `$${(p / 1000000).toFixed(1)}M`;
    return `$${(p / 1000).toFixed(0)}K`;
  };

  if (compact) {
    return (
      <div
        className="glass rounded-xl overflow-hidden cursor-pointer hover:bg-white/[0.08] transition-all"
        onClick={() => selectProperty(property.id)}
      >
        <div className="aspect-[4/3] relative">
          <img src={property.images[0]} alt={property.address} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white font-bold">{formatPrice(property.price)}</p>
            <p className="text-white/70 text-xs">{property.beds}bd • {property.baths}ba • {property.sqft.toLocaleString()}sf</p>
          </div>
          {property.tags[0] && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500/90 rounded-full text-[10px] font-bold text-white">
              {property.tags[0]}
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-400 truncate">{property.address}, {property.city}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>❤️ {property.likeCount + (isLiked ? 1 : 0)}</span>
            <span>💬 {property.commentCount}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-b border-slate-800 animate-fade-in">
      {/* Agent header */}
      {agent && (
        <div className="flex items-center gap-2 px-4 py-2">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => selectAgent(agent.id)}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate cursor-pointer hover:text-indigo-400" onClick={() => selectAgent(agent.id)}>
              {agent.name}
            </p>
            <p className="text-[10px] text-slate-500">{agent.brokerage} • {property.city}</p>
          </div>
          <span className="text-xs text-indigo-400 font-medium">{property.matchScore}% match</span>
        </div>
      )}

      {/* Image carousel */}
      <div className="relative aspect-[4/3] bg-slate-800" onClick={handleDoubleTap}>
        <img
          src={property.images[currentImage]}
          alt={`${property.address} photo ${currentImage + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Image nav arrows */}
        {property.images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm hover:bg-black/70">‹</button>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm hover:bg-black/70">›</button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {property.images.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentImage ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </>
        )}

        {/* Tags */}
        {property.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex gap-1.5">
            {property.tags.slice(0, 2).map(tag => (
              <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                tag === "New Listing" ? "bg-emerald-500/90" :
                tag === "Price Drop" ? "bg-coral-500/90" :
                tag === "Hot Market" ? "bg-amber-500/90" :
                "bg-indigo-500/90"
              }`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Image counter */}
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/50 rounded-full text-[10px] text-white">
          {currentImage + 1}/{property.images.length}
        </span>

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
          <p className="text-2xl font-bold text-white">${property.price.toLocaleString()}</p>
          <p className="text-white/80 text-sm">{property.beds} bd  •  {property.baths} ba  •  {property.sqft.toLocaleString()} sqft</p>
        </div>

        {/* Double-tap heart */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-7xl heart-burst">❤️</span>
          </div>
        )}
      </div>

      {/* Actions bar */}
      <div className="flex items-center px-4 py-2 gap-4">
        <button onClick={() => toggleLike(property.id)} className="flex items-center gap-1 text-sm">
          <span className={isLiked ? "text-coral-500" : "text-slate-400"}>{isLiked ? "❤️" : "🤍"}</span>
          <span className={isLiked ? "text-coral-500 font-medium" : "text-slate-400"}>{property.likeCount + (isLiked ? 1 : 0)}</span>
        </button>
        <button onClick={() => selectProperty(property.id)} className="flex items-center gap-1 text-sm text-slate-400">
          <span>💬</span>
          <span>{property.commentCount}</span>
        </button>
        <button className="text-sm text-slate-400">📤</button>
        <div className="flex-1" />
        <button onClick={() => toggleSave(property.id)} className="text-lg">
          {isSaved ? "🔖" : "📑"}
        </button>
      </div>

      {/* Address */}
      <div className="px-4 pb-1">
        <p className="text-sm text-slate-300 cursor-pointer hover:text-white" onClick={() => selectProperty(property.id)}>
          {property.address}, {property.city} {property.state} {property.zip}
        </p>
      </div>

      {/* Description preview */}
      <div className="px-4 pb-2">
        <p className="text-xs text-slate-500 line-clamp-2">{property.description}</p>
      </div>

      {/* Timestamp */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-slate-600">{property.daysOnMarket === 0 ? "Listed today" : `${property.daysOnMarket} days ago`}</p>
      </div>
    </div>
  );
}
