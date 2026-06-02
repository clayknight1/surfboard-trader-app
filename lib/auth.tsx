import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';
import { supabase } from './supabase';
import { getUserProfile } from './services/userService';
import { fetchUnreadCount } from './services/messageService';
import { SplashScreen } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  user: SupabaseUser | null;
  profile: User | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const queryClient = useQueryClient();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await refreshSession();
      } catch (err) {
        if (alive) setSession(null);
      } finally {
        if (alive) {
          setLoading(false);
          await SplashScreen.hideAsync();
        }
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setProfile(null);
        setUnreadCount(0);
      }
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    const userId = session.user.id;
    const channel = supabase
      .channel(`unread:${userId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        async () => {
          const count = await fetchUnreadCount(userId);
          setUnreadCount(count);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const { data: fetchedProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: () => getUserProfile(session!.user!.id),
    enabled: !!session?.user?.id,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    refetchOnReconnect: true,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setProfile(fetchedProfile ?? null);
  }, [fetchedProfile]);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }
    let cancelled = false;
    const userId = session.user.id;

    fetchUnreadCount(userId).then((count) => {
      if (!cancelled) {
        setUnreadCount(count);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  async function refreshSession() {
    const { data, error } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    setUser(data.session?.user ?? null);
    if (!data.session) {
      setProfile(null);
    }
  }

  async function refreshProfile() {
    if (session?.user?.id) {
      await queryClient.invalidateQueries({
        queryKey: ['profile', session.user.id],
      });
    }
  }

  const signOut = async () => {
    await supabase.removeAllChannels();
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setUnreadCount(0);
  };

  async function refreshUnreadCount() {
    if (session?.user?.id) {
      const count = await fetchUnreadCount(session.user.id);
      setUnreadCount(count);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signOut,
        refreshSession,
        refreshProfile,
        unreadCount,
        refreshUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
