"use client";

import { useState } from "react";
import Feed from "./components/Feed";
import Explore from "./components/Explore";
import DreamBoards from "./components/DreamBoards";
import Messages from "./components/Messages";
import Profile from "./components/Profile";
import PropertyDetail from "./components/PropertyDetail";
import NeighborhoodDetail from "./components/NeighborhoodDetail";
import AgentDetail from "./components/AgentDetail";
import BottomNav from "./components/BottomNav";
import { AppProvider, useApp } from "./hooks/useApp";
import { AuthProvider, useAuth } from "./hooks/useAuth";

type Tab = "feed" | "explore" | "boards" | "messages" | "profile";

function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const { selectedPropertyId, selectedNeighborhoodId, selectedAgentId, clearSelection } = useApp();
  const { loading } = useAuth();

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading HomeFeed...</p>
        </div>
      </div>
    );
  }

  // Detail views override tabs
  if (selectedPropertyId) {
    return <PropertyDetail propertyId={selectedPropertyId} onBack={clearSelection} />;
  }
  if (selectedNeighborhoodId) {
    return <NeighborhoodDetail neighborhoodId={selectedNeighborhoodId} onBack={clearSelection} />;
  }
  if (selectedAgentId) {
    return <AgentDetail agentId={selectedAgentId} onBack={clearSelection} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 max-w-lg mx-auto relative">
      <div className="flex-1 overflow-hidden">
        {activeTab === "feed" && <Feed />}
        {activeTab === "explore" && <Explore />}
        {activeTab === "boards" && <DreamBoards />}
        {activeTab === "messages" && <Messages />}
        {activeTab === "profile" && <Profile />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </AuthProvider>
  );
}
