import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';
import { supabase } from './supabase';
import { getUserProfile } from './services/userService';
import { fetchUnreadCount } from './services/messageService';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  user: SupabaseUser | null;
  profile: User | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await refreshSession();
      } catch {
        if (alive) setSession(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        const profile = await getUserProfile(session.user.id!);
        setProfile(profile);
        const count = await fetchUnreadCount(session.user.id);
        setUnreadCount(count);
      } else {
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
    if (!session?.user?.id) return;

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

  async function refreshSession() {
    const { data, error } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    setUser(data.session?.user ?? null);
    if (data.session?.user?.id) {
      const profile = await getUserProfile(data.session.user.id);
      setProfile(profile);
    } else {
      setProfile(null);
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
