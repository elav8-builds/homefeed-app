"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isDemo: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // No Supabase configured — demo mode
      setIsDemo(true);
      setLoading(false);
      return;
    }

    setIsDemo(false);

    // Dynamic import to avoid errors when env vars are missing
    import("../../lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();

      // Get initial session
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        if (user) {
          supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
            .then(({ data }) => {
              setProfile(data as UserProfile | null);
            });
        }
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user ?? null);
          if (session?.user) {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            setProfile(data as UserProfile | null);
          } else {
            setProfile(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    });
  }, []);

  const signOut = async () => {
    if (isDemo) return;
    const { createClient } = await import("../../lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
