"use client";

import { useApp } from "../hooks/useApp";
import { agents } from "../data/agents";
import { properties } from "../data/properties";
import PropertyCard from "./PropertyCard";

interface Props {
  agentId: string;
  onBack: () => void;
}

export default function AgentDetail({ agentId, onBack }: Props) {
  const agent = agents.find(a => a.id === agentId);
  const { followedAgents, toggleFollowAgent } = useApp();

  if (!agent) return <div className="p-4 text-slate-400">Agent not found</div>;

  const isFollowed = followedAgents.has(agent.id);
  const agentProperties = properties.filter(p => p.agentId === agent.id);

  return (
    <div className="h-screen flex flex-col bg-slate-950 max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-lg">←</button>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{agent.name}</p>
          <p className="text-xs text-slate-500">{agent.brokerage}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Agent header */}
        <div className="p-4">
          <div className="glass rounded-2xl p-6 text-center">
            <img src={agent.avatar} alt={agent.name} className="w-20 h-20 rounded-full mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white">{agent.name}</h2>
            <p className="text-sm text-slate-400">{agent.brokerage}</p>
            <p className="text-xs text-slate-500 mt-1">✅ Verified Agent • {agent.yearsExp} years experience</p>

            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{agent.followerCount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{agentProperties.length}</p>
                <p className="text-xs text-slate-500">Listings</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">⭐ {agent.rating}</p>
                <p className="text-xs text-slate-500">{agent.reviewCount} reviews</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => toggleFollowAgent(agent.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isFollowed ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-indigo-500 text-white hover:bg-indigo-400"
                }`}
              >
                {isFollowed ? "✓ Following" : "Follow"}
              </button>
              <button className="flex-1 py-2.5 glass rounded-xl text-sm font-medium text-slate-300 hover:text-white">
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 mb-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">📊 Performance</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold gradient-text">{agent.homesSoldYtd}</p>
                <p className="text-xs text-slate-500">Homes Sold (YTD)</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold gradient-text">{agent.avgDaysToClose}</p>
                <p className="text-xs text-slate-500">Avg Days to Close</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold gradient-text">{agent.avgSaleVsList}%</p>
                <p className="text-xs text-slate-500">Sale vs List Price</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold gradient-text">{agent.rating}</p>
                <p className="text-xs text-slate-500">Rating ({agent.reviewCount})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-4 mb-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-2">About</h3>
            <p className="text-sm text-slate-400">{agent.bio}</p>
          </div>
        </div>

        {/* Specialties */}
        <div className="px-4 mb-4">
          <h3 className="text-sm font-bold text-white mb-2">Specialties</h3>
          <div className="flex flex-wrap gap-1.5">
            {agent.specialties.map(s => (
              <span key={s} className="px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300">{s}</span>
            ))}
          </div>
        </div>

        {/* Neighborhoods */}
        <div className="px-4 mb-4">
          <h3 className="text-sm font-bold text-white mb-2">Neighborhoods</h3>
          <div className="flex flex-wrap gap-1.5">
            {agent.neighborhoods.map(n => (
              <span key={n} className="px-2 py-1 glass rounded-full text-xs text-slate-300">{n}</span>
            ))}
          </div>
        </div>

        {/* Listings */}
        {agentProperties.length > 0 && (
          <div className="px-4 mb-6">
            <h3 className="text-sm font-bold text-white mb-3">🏠 Active Listings ({agentProperties.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {agentProperties.map(p => (
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
