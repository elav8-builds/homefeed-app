"use client";

import { useApp } from "../hooks/useApp";
import { properties } from "../data/properties";
import PropertyCard from "./PropertyCard";

export default function Profile() {
  const { likedProperties, savedProperties, boards, followedAgents, followedNeighborhoods, vibeMatchComplete, vibeProfile } = useApp();

  const likedList = properties.filter(p => likedProperties.has(p.id));
  const savedList = properties.filter(p => savedProperties.has(p.id));

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white">Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* User card */}
        <div className="p-4">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-coral-500 flex items-center justify-center text-3xl text-white font-bold mb-3">
              B
            </div>
            <h2 className="text-xl font-bold text-white">Beau Bratton</h2>
            <p className="text-sm text-slate-400">Home Browser • Austin, TX</p>

            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{likedProperties.size}</p>
                <p className="text-xs text-slate-500">Liked</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{savedProperties.size}</p>
                <p className="text-xs text-slate-500">Saved</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{boards.length}</p>
                <p className="text-xs text-slate-500">Boards</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{followedAgents.size}</p>
                <p className="text-xs text-slate-500">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vibe Profile */}
        <div className="px-4 mb-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-2">🎯 Your Vibe Profile</h3>
            {vibeMatchComplete ? (
              <div className="flex flex-wrap gap-1.5">
                {vibeProfile.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300">{tag}</span>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 mb-2">Complete Vibe Match to see your taste profile</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 bg-slate-800 rounded-full text-xs text-slate-500">Modern</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-full text-xs text-slate-500">Open Floor Plan</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-full text-xs text-slate-500">Pool</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-full text-xs text-slate-500">Walkable</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity stats */}
        <div className="px-4 mb-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">📊 Activity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold gradient-text">{likedProperties.size}</p>
                <p className="text-xs text-slate-500">Homes Liked</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold gradient-text">{savedProperties.size}</p>
                <p className="text-xs text-slate-500">Homes Saved</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold gradient-text">{followedNeighborhoods.size}</p>
                <p className="text-xs text-slate-500">Neighborhoods</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold gradient-text">{followedAgents.size}</p>
                <p className="text-xs text-slate-500">Agents Followed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent likes */}
        {likedList.length > 0 && (
          <div className="px-4 mb-4">
            <h3 className="text-sm font-bold text-white mb-3">❤️ Recently Liked</h3>
            <div className="grid grid-cols-2 gap-3">
              {likedList.slice(0, 4).map(p => (
                <PropertyCard key={p.id} propertyId={p.id} compact />
              ))}
            </div>
          </div>
        )}

        {/* Recent saves */}
        {savedList.length > 0 && (
          <div className="px-4 mb-6">
            <h3 className="text-sm font-bold text-white mb-3">🔖 Recently Saved</h3>
            <div className="grid grid-cols-2 gap-3">
              {savedList.slice(0, 4).map(p => (
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
