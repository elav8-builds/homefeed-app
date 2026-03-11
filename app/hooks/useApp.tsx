"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface Board {
  id: string;
  name: string;
  isPublic: boolean;
  propertyIds: string[];
  description: string;
}

interface AppState {
  likedProperties: Set<string>;
  savedProperties: Set<string>;
  followedAgents: Set<string>;
  followedNeighborhoods: Set<string>;
  boards: Board[];
  selectedPropertyId: string | null;
  selectedNeighborhoodId: string | null;
  selectedAgentId: string | null;
  vibeMatchComplete: boolean;
  vibeProfile: string[];
}

interface AppContextType extends AppState {
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  toggleFollowAgent: (id: string) => void;
  toggleFollowNeighborhood: (id: string) => void;
  selectProperty: (id: string) => void;
  selectNeighborhood: (id: string) => void;
  selectAgent: (id: string) => void;
  clearSelection: () => void;
  createBoard: (name: string) => void;
  addToBoard: (boardId: string, propertyId: string) => void;
  removeFromBoard: (boardId: string, propertyId: string) => void;
  completeVibeMatch: (tags: string[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [likedProperties, setLikedProperties] = useState<Set<string>>(new Set());
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [followedAgents, setFollowedAgents] = useState<Set<string>>(new Set());
  const [followedNeighborhoods, setFollowedNeighborhoods] = useState<Set<string>>(new Set());
  const [boards, setBoards] = useState<Board[]>([
    { id: "shortlist", name: "The Shortlist", isPublic: false, propertyIds: [], description: "Homes I'm seriously considering" },
    { id: "dreams", name: "Dream Homes", isPublic: true, propertyIds: [], description: "Aspirational finds" },
  ]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [vibeMatchComplete, setVibeMatchComplete] = useState(false);
  const [vibeProfile, setVibeProfile] = useState<string[]>([]);

  const toggleLike = useCallback((id: string) => {
    setLikedProperties(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedProperties(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleFollowAgent = useCallback((id: string) => {
    setFollowedAgents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleFollowNeighborhood = useCallback((id: string) => {
    setFollowedNeighborhoods(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectProperty = useCallback((id: string) => setSelectedPropertyId(id), []);
  const selectNeighborhood = useCallback((id: string) => setSelectedNeighborhoodId(id), []);
  const selectAgent = useCallback((id: string) => setSelectedAgentId(id), []);
  const clearSelection = useCallback(() => {
    setSelectedPropertyId(null);
    setSelectedNeighborhoodId(null);
    setSelectedAgentId(null);
  }, []);

  const createBoard = useCallback((name: string) => {
    setBoards(prev => [...prev, {
      id: `board-${Date.now()}`,
      name,
      isPublic: false,
      propertyIds: [],
      description: "",
    }]);
  }, []);

  const addToBoard = useCallback((boardId: string, propertyId: string) => {
    setBoards(prev => prev.map(b =>
      b.id === boardId && !b.propertyIds.includes(propertyId)
        ? { ...b, propertyIds: [...b.propertyIds, propertyId] }
        : b
    ));
  }, []);

  const removeFromBoard = useCallback((boardId: string, propertyId: string) => {
    setBoards(prev => prev.map(b =>
      b.id === boardId
        ? { ...b, propertyIds: b.propertyIds.filter(id => id !== propertyId) }
        : b
    ));
  }, []);

  const completeVibeMatch = useCallback((tags: string[]) => {
    setVibeProfile(tags);
    setVibeMatchComplete(true);
  }, []);

  return (
    <AppContext.Provider value={{
      likedProperties, savedProperties, followedAgents, followedNeighborhoods,
      boards, selectedPropertyId, selectedNeighborhoodId, selectedAgentId,
      vibeMatchComplete, vibeProfile,
      toggleLike, toggleSave, toggleFollowAgent, toggleFollowNeighborhood,
      selectProperty, selectNeighborhood, selectAgent, clearSelection,
      createBoard, addToBoard, removeFromBoard, completeVibeMatch,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
