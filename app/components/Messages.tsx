"use client";

import { useState } from "react";

const conversations = [
  { id: "1", name: "Jane Smith", avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=6366f1&color=fff", lastMessage: "I'd love to show you that property on Oak Valley!", time: "2m ago", unread: true, isAgent: true },
  { id: "2", name: "Mike & Sarah", avatar: "https://ui-avatars.com/api/?name=M+S&background=f97066&color=fff", lastMessage: "What do you think about the Lakewood house?", time: "15m ago", unread: true, isAgent: false },
  { id: "3", name: "Carlos Rivera", avatar: "https://ui-avatars.com/api/?name=Carlos+Rivera&background=10b981&color=fff", lastMessage: "The open house is Saturday at 2pm", time: "1h ago", unread: false, isAgent: true },
  { id: "4", name: "House Hunting Group", avatar: "https://ui-avatars.com/api/?name=HH&background=f59e0b&color=fff", lastMessage: "Emily: Found another one in Mueller!", time: "3h ago", unread: false, isAgent: false },
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  if (selectedChat) {
    const chat = conversations.find(c => c.id === selectedChat);
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
          <button onClick={() => setSelectedChat(null)} className="text-slate-400 hover:text-white">←</button>
          <img src={chat?.avatar} alt="" className="w-8 h-8 rounded-full" />
          <div>
            <p className="text-sm font-semibold text-white">{chat?.name}</p>
            <p className="text-[10px] text-slate-500">{chat?.isAgent ? "Agent" : "Group"}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Sample messages */}
          <div className="flex justify-start">
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-2 max-w-[75%]">
              <p className="text-sm text-slate-300">{chat?.lastMessage}</p>
              <p className="text-[10px] text-slate-600 mt-1">{chat?.time}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-indigo-500/20 border border-indigo-500/20 rounded-2xl rounded-br-sm px-4 py-2 max-w-[75%]">
              <p className="text-sm text-indigo-200">Thanks! I&apos;ll check it out 🏠</p>
              <p className="text-[10px] text-indigo-400/50 mt-1">Just now</p>
            </div>
          </div>

          {/* Shared property card */}
          <div className="flex justify-start">
            <div className="glass rounded-2xl overflow-hidden max-w-[80%]">
              <div className="aspect-video bg-gradient-to-br from-indigo-900/30 to-slate-800 flex items-center justify-center">
                <span className="text-4xl">🏠</span>
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-white">$725,000</p>
                <p className="text-xs text-slate-400">1247 Oak Valley Dr • 4bd 3ba</p>
                <button className="mt-2 text-xs text-indigo-400 font-medium">View Listing →</button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              onKeyDown={e => {
                if (e.key === "Enter" && messageInput.trim()) {
                  setMessageInput("");
                }
              }}
            />
            <button
              onClick={() => messageInput.trim() && setMessageInput("")}
              disabled={!messageInput.trim()}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 rounded-full text-sm text-white font-medium transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white">Messages</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(chat => (
          <div
            key={chat.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/50 cursor-pointer transition-colors border-b border-slate-800/50"
            onClick={() => setSelectedChat(chat.id)}
          >
            <div className="relative">
              <img src={chat.avatar} alt="" className="w-12 h-12 rounded-full" />
              {chat.isAgent && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[8px] text-white border-2 border-slate-950">
                  ✓
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-semibold ${chat.unread ? "text-white" : "text-slate-300"}`}>{chat.name}</p>
                <p className="text-[10px] text-slate-500">{chat.time}</p>
              </div>
              <p className={`text-xs truncate ${chat.unread ? "text-slate-300" : "text-slate-500"}`}>{chat.lastMessage}</p>
            </div>
            {chat.unread && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
          </div>
        ))}
      </div>
    </div>
  );
}
