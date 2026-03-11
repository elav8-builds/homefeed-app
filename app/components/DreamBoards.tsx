"use client";

import { useState } from "react";
import { useApp } from "../hooks/useApp";
import { properties } from "../data/properties";
import PropertyCard from "./PropertyCard";

export default function DreamBoards() {
  const { boards, createBoard, savedProperties } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  const handleCreate = () => {
    if (newBoardName.trim()) {
      createBoard(newBoardName.trim());
      setNewBoardName("");
      setShowCreate(false);
    }
  };

  const savedList = properties.filter(p => savedProperties.has(p.id));
  const activeBoard = selectedBoard ? boards.find(b => b.id === selectedBoard) : null;

  if (activeBoard) {
    const boardProperties = properties.filter(p => activeBoard.propertyIds.includes(p.id));
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
          <button onClick={() => setSelectedBoard(null)} className="text-slate-400 hover:text-white">←</button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{activeBoard.name}</h2>
            <p className="text-xs text-slate-500">{boardProperties.length} homes • {activeBoard.isPublic ? "Public" : "Private"}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {boardProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">📌</p>
              <p className="text-slate-400">No homes saved to this board yet</p>
              <p className="text-sm text-slate-600 mt-1">Save properties from your feed to add them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {boardProperties.map(p => (
                <PropertyCard key={p.id} propertyId={p.id} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white">Dream Boards</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 font-medium hover:bg-indigo-500/30 transition-all"
        >
          + New Board
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Saved section */}
        <div
          className="glass rounded-2xl p-4 cursor-pointer hover:bg-white/[0.08] transition-all"
          onClick={() => setSelectedBoard(null)}
        >
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-coral-500/20 to-coral-600/20 border border-coral-500/20 flex items-center justify-center text-2xl">
              🔖
            </div>
            <div>
              <h3 className="font-bold text-white">All Saved</h3>
              <p className="text-xs text-slate-500">{savedList.length} homes saved</p>
            </div>
          </div>
        </div>

        {/* Boards */}
        {boards.map(board => (
          <div
            key={board.id}
            className="glass rounded-2xl p-4 cursor-pointer hover:bg-white/[0.08] transition-all"
            onClick={() => setSelectedBoard(board.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-2xl">
                📌
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{board.name}</h3>
                <p className="text-xs text-slate-500">
                  {board.propertyIds.length} homes • {board.isPublic ? "🌐 Public" : "🔒 Private"}
                </p>
                {board.description && <p className="text-xs text-slate-600 mt-0.5">{board.description}</p>}
              </div>
              <span className="text-slate-600">›</span>
            </div>
          </div>
        ))}

        {/* Create board modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-4">Create New Board</h3>
              <input
                type="text"
                value={newBoardName}
                onChange={e => setNewBoardName(e.target.value)}
                placeholder="Board name..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500 mb-4"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleCreate()}
              />
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-3 glass rounded-xl text-slate-400 font-medium">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newBoardName.trim()}
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
