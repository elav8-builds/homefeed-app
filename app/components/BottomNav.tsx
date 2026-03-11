"use client";

type Tab = "feed" | "explore" | "boards" | "messages" | "profile";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: "feed", icon: "🏠", label: "Feed" },
  { id: "explore", icon: "🔍", label: "Explore" },
  { id: "boards", icon: "📌", label: "Boards" },
  { id: "messages", icon: "💬", label: "Messages" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-slate-900/95 backdrop-blur-xl border-t border-slate-800">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 min-w-[56px] ${
            activeTab === tab.id
              ? "text-indigo-400 scale-105"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-[10px] font-medium">{tab.label}</span>
          {activeTab === tab.id && (
            <div className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
          )}
        </button>
      ))}
    </nav>
  );
}
