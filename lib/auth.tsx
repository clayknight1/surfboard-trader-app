import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';
import { supabase } from './supabase';
import { getUserProfile } from './services/userService';
import { fetchUnreadCount } from './services/messageService';
import { Alert } from 'react-native';
import { SplashScreen } from 'expo-router';

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

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await Promise.race([
          refreshSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 10000),
          ),
        ]);
      } catch (err) {
        if (alive) {
          setSession(null);
          if (err instanceof Error && err.message === 'Auth timeout') {
            Alert.alert(
              'Connection issue',
              'Could not connect to the server. Please check your connection and restart the app.',
            );
          }
        }
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

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }
    getUserProfile(session.user.id).then(setProfile);
    fetchUnreadCount(session.user.id).then(setUnreadCount);
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
      const profile = await getUserProfile(session.user.id);
      setProfile(profile);
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
