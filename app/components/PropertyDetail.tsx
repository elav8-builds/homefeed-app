"use client";

import { useState } from "react";
import { useApp } from "../hooks/useApp";
import { properties } from "../data/properties";
import { agents } from "../data/agents";
import { neighborhoods } from "../data/neighborhoods";

interface Props {
  propertyId: string;
  onBack: () => void;
}

export default function PropertyDetail({ propertyId, onBack }: Props) {
  const property = properties.find(p => p.id === propertyId);
  const agent = property ? agents.find(a => a.id === property.agentId) : null;
  const hood = property ? neighborhoods.find(n => n.id === property.neighborhoodId) : null;
  const { likedProperties, savedProperties, toggleLike, toggleSave, selectAgent, selectNeighborhood, boards, addToBoard } = useApp();
  const [currentImage, setCurrentImage] = useState(0);
  const [tab, setTab] = useState<"details" | "comments" | "neighborhood">("details");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    { id: "1", user: "mike_b", text: "That kitchen island is gorgeous 😍", time: "2h ago", likes: 12 },
    { id: "2", user: "sarah_r", text: "What's the HOA?", time: "1h ago", likes: 3 },
    { id: "3", user: "tom_k", text: "Visited yesterday — the backyard is even better in person", time: "45m ago", likes: 8 },
  ]);
  const [showBoardPicker, setShowBoardPicker] = useState(false);
  const [voteResult, setVoteResult] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  if (!property) return <div className="p-4 text-slate-400">Property not found</div>;

  const isLiked = likedProperties.has(property.id);
  const isSaved = savedProperties.has(property.id);

  const handleComment = () => {
    if (comment.trim()) {
      setComments(prev => [...prev, { id: `c-${Date.now()}`, user: "you", text: comment, time: "Just now", likes: 0 }]);
      setComment("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-lg">←</button>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">${property.price.toLocaleString()}</p>
          <p className="text-xs text-slate-500 truncate">{property.address}</p>
        </div>
        <button onClick={() => toggleSave(property.id)} className="text-xl">{isSaved ? "🔖" : "📑"}</button>
        <button onClick={() => setShowBoardPicker(true)} className="text-xl">📌</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Image carousel */}
        <div className="relative aspect-[4/3] bg-slate-800">
          <img src={property.images[currentImage]} alt="" className="w-full h-full object-cover" />
          {property.images.length > 1 && (
            <>
              <button onClick={() => setCurrentImage(i => (i - 1 + property.images.length) % property.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">‹</button>
              <button onClick={() => setCurrentImage(i => (i + 1) % property.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">›</button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {property.images.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentImage ? "bg-white" : "bg-white/40"}`} />
                ))}
              </div>
            </>
          )}
          {property.tags.length > 0 && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {property.tags.map(tag => (
                <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                  tag === "New Listing" ? "bg-emerald-500/90" :
                  tag === "Price Drop" ? "bg-red-500/90" :
                  tag === "Hot Market" ? "bg-amber-500/90" :
                  "bg-indigo-500/90"
                }`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center px-4 py-3 gap-4 border-b border-slate-800">
          <button onClick={() => toggleLike(property.id)} className="flex items-center gap-1.5">
            <span className={`text-xl ${isLiked ? "text-coral-500" : ""}`}>{isLiked ? "❤️" : "🤍"}</span>
            <span className={`text-sm ${isLiked ? "text-coral-500 font-medium" : "text-slate-400"}`}>{property.likeCount + (isLiked ? 1 : 0)}</span>
          </button>
          <button onClick={() => setTab("comments")} className="flex items-center gap-1.5 text-sm text-slate-400">
            <span className="text-xl">💬</span> {comments.length}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `${property.address} - $${property.price.toLocaleString()}`, text: "Check out this property on HomeFeed!", url: `${window.location.origin}/property/${property.id}` });
              }
            }}
            className="text-xl text-slate-400 hover:text-slate-300 transition-colors"
          >📤</button>
          <div className="flex-1" />
          <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">{property.matchScore}% match</span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-0 border-b border-slate-800">
          {[
            { label: "Beds", value: property.beds },
            { label: "Baths", value: property.baths },
            { label: "Sqft", value: property.sqft.toLocaleString() },
            { label: "Year", value: property.yearBuilt },
          ].map(stat => (
            <div key={stat.label} className="text-center py-3">
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Would you buy it? Poll */}
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-xs font-bold text-slate-400 mb-2">Would you buy this home?</p>
          <div className="flex gap-2">
            {["Yes 🏡", "Maybe 🤔", "No 👎"].map(option => (
              <button
                key={option}
                onClick={() => setVoteResult(option)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  voteResult === option
                    ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
                    : "glass text-slate-400 hover:text-slate-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {voteResult && <p className="text-[10px] text-slate-500 mt-1.5">73% of viewers said &quot;Yes&quot; • 847 votes</p>}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          {(["details", "comments", "neighborhood"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                tab === t ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-500"
              }`}
            >
              {t === "details" ? "Details" : t === "comments" ? `Comments (${comments.length})` : "Neighborhood"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {tab === "details" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Description</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{property.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Property Info</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="glass rounded-lg p-2"><span className="text-slate-500">Type:</span> <span className="text-slate-300">{property.propertyType.replace(/_/g, " ")}</span></div>
                  <div className="glass rounded-lg p-2"><span className="text-slate-500">Lot:</span> <span className="text-slate-300">{property.lotSize > 0 ? `${property.lotSize} acres` : "N/A"}</span></div>
                  <div className="glass rounded-lg p-2"><span className="text-slate-500">Built:</span> <span className="text-slate-300">{property.yearBuilt}</span></div>
                  <div className="glass rounded-lg p-2"><span className="text-slate-500">DOM:</span> <span className="text-slate-300">{property.daysOnMarket} days</span></div>
                </div>
              </div>
              {agent && (
                <div className="glass rounded-xl p-3 cursor-pointer hover:bg-white/[0.08]" onClick={() => selectAgent(agent.id)}>
                  <p className="text-xs text-slate-500 mb-1">Listed by</p>
                  <div className="flex items-center gap-2">
                    <img src={agent.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-semibold text-white">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.brokerage} • ⭐ {agent.rating}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "comments" && (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 font-bold flex-shrink-0">
                    {c.user[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs">
                      <span className="font-semibold text-white">{c.user}</span>{" "}
                      <span className="text-slate-400">{c.text}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-600">
                      <span>{c.time}</span>
                      <button className="hover:text-slate-400">❤️ {c.likes}</button>
                      <button className="hover:text-slate-400">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "neighborhood" && hood && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4 cursor-pointer" onClick={() => selectNeighborhood(hood.id)}>
                <h3 className="font-bold text-white mb-1">{hood.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{hood.description}</p>
                <div className="space-y-2">
                  {Object.entries(hood.vibeScores).slice(0, 4).map(([key, score]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-20 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <div className="flex-1 score-bar"><div className="score-bar-fill" style={{ width: `${(score as number) * 10}%` }} /></div>
                      <span className="text-xs text-slate-400 w-6">{score as number}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-xs text-indigo-400 font-medium">View Full Neighborhood Page →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comment input (when on comments tab) */}
      {tab === "comments" && (
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              onKeyDown={e => e.key === "Enter" && handleComment()}
            />
            <button onClick={handleComment} disabled={!comment.trim()} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 rounded-full text-sm text-white transition-all">
              Post
            </button>
          </div>
        </div>
      )}

      {/* Board picker modal */}
      {showBoardPicker && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setShowBoardPicker(false)}>
          <div className="w-full bg-slate-900 rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Save to Board</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {boards.map(board => (
                <button
                  key={board.id}
                  onClick={() => { addToBoard(board.id, property.id); setShowBoardPicker(false); showToast(`Saved to "${board.name}"`); }}
                  className="w-full flex items-center gap-3 p-3 glass rounded-xl hover:bg-white/[0.08] text-left"
                >
                  <span className="text-xl">📌</span>
                  <div>
                    <p className="text-sm font-medium text-white">{board.name}</p>
                    <p className="text-xs text-slate-500">{board.propertyIds.length} homes</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-full shadow-lg animate-fade-in z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
