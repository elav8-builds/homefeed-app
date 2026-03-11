"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "./useAuth";

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
  const { user, isDemo } = useAuth();
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

  // Load user's state from Supabase when authenticated
  useEffect(() => {
    if (isDemo || !user) return;

    const loadUserState = async () => {
      try {
        // Fetch likes/saves/follows from Supabase directly via client
        const { createClient } = await import("../../lib/supabase/client");
        const supabase = createClient();

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const [likesData, savesData, followsData, boardsData] = await Promise.all([
          supabase.from("likes").select("property_id").eq("user_id", user.id),
          supabase.from("saves").select("property_id").eq("user_id", user.id),
          supabase.from("follows").select("target_type, target_id").eq("user_id", user.id),
          supabase.from("boards").select("*, board_properties(property_id)").eq("user_id", user.id),
        ]) as any[];

        if (likesData.data) {
          setLikedProperties(new Set(likesData.data.map((l: any) => l.property_id)));
        }
        if (savesData.data) {
          setSavedProperties(new Set(savesData.data.map((s: any) => s.property_id)));
        }
        if (followsData.data) {
          setFollowedAgents(new Set(
            followsData.data.filter((f: any) => f.target_type === "agent").map((f: any) => f.target_id)
          ));
          setFollowedNeighborhoods(new Set(
            followsData.data.filter((f: any) => f.target_type === "neighborhood").map((f: any) => f.target_id)
          ));
        }
        if (boardsData.data) {
          setBoards(boardsData.data.map((b: any) => ({
            id: b.id,
            name: b.name,
            isPublic: b.is_public,
            propertyIds: (b.board_properties as { property_id: string }[])?.map(bp => bp.property_id) || [],
            description: b.description || "",
          })));
        }

        // Load vibe profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("vibe_profile")
          .eq("id", user.id)
          .single() as any;

        if (profile?.vibe_profile) {
          const vp = profile.vibe_profile as string[];
          if (Array.isArray(vp) && vp.length > 0) {
            setVibeProfile(vp);
            setVibeMatchComplete(true);
          }
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
      } catch (err) {
        console.error("Failed to load user state:", err);
      }
    };

    loadUserState();
  }, [user, isDemo]);

  // Helper: call API when authenticated, or just do local state for demo
  const apiCall = useCallback(async (url: string, options?: RequestInit) => {
    if (isDemo) return null;
    try {
      const res = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...options?.headers },
      });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  }, [isDemo]);

  const toggleLike = useCallback((id: string) => {
    setLikedProperties(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    // Sync to backend
    apiCall(`/api/properties/${id}/like`, { method: "POST" });
  }, [apiCall]);

  const toggleSave = useCallback((id: string) => {
    setSavedProperties(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    apiCall(`/api/properties/${id}/save`, { method: "POST" });
  }, [apiCall]);

  const toggleFollowAgent = useCallback((id: string) => {
    setFollowedAgents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    apiCall("/api/follows", {
      method: "POST",
      body: JSON.stringify({ target_type: "agent", target_id: id }),
    });
  }, [apiCall]);

  const toggleFollowNeighborhood = useCallback((id: string) => {
    setFollowedNeighborhoods(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    apiCall("/api/follows", {
      method: "POST",
      body: JSON.stringify({ target_type: "neighborhood", target_id: id }),
    });
  }, [apiCall]);

  const selectProperty = useCallback((id: string) => setSelectedPropertyId(id), []);
  const selectNeighborhood = useCallback((id: string) => setSelectedNeighborhoodId(id), []);
  const selectAgent = useCallback((id: string) => setSelectedAgentId(id), []);
  const clearSelection = useCallback(() => {
    setSelectedPropertyId(null);
    setSelectedNeighborhoodId(null);
    setSelectedAgentId(null);
  }, []);

  const createBoard = useCallback((name: string) => {
    const tempId = `board-${Date.now()}`;
    setBoards(prev => [...prev, {
      id: tempId,
      name,
      isPublic: false,
      propertyIds: [],
      description: "",
    }]);
    // Sync to backend — update local ID with server ID
    apiCall("/api/boards", {
      method: "POST",
      body: JSON.stringify({ name }),
    }).then(data => {
      if (data?.id) {
        setBoards(prev => prev.map(b => b.id === tempId ? { ...b, id: data.id } : b));
      }
    });
  }, [apiCall]);

  const addToBoard = useCallback((boardId: string, propertyId: string) => {
    setBoards(prev => prev.map(b =>
      b.id === boardId && !b.propertyIds.includes(propertyId)
        ? { ...b, propertyIds: [...b.propertyIds, propertyId] }
        : b
    ));
    apiCall(`/api/boards/${boardId}/properties`, {
      method: "POST",
      body: JSON.stringify({ property_id: propertyId }),
    });
  }, [apiCall]);

  const removeFromBoard = useCallback((boardId: string, propertyId: string) => {
    setBoards(prev => prev.map(b =>
      b.id === boardId
        ? { ...b, propertyIds: b.propertyIds.filter(id => id !== propertyId) }
        : b
    ));
    apiCall(`/api/boards/${boardId}/properties?property_id=${propertyId}`, {
      method: "DELETE",
    });
  }, [apiCall]);

  const completeVibeMatch = useCallback((tags: string[]) => {
    setVibeProfile(tags);
    setVibeMatchComplete(true);
    apiCall("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ vibe_profile: tags }),
    });
  }, [apiCall]);

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
