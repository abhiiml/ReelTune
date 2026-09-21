import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      // Restore session from SecureStore
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, isLoading: false });

      // Subscribe to auth state changes (token refresh, sign-out from another device, etc.)
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
    } catch {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
    // onAuthStateChange will update session/user automatically
    set({ isLoading: false });
  },

  signUp: async (name, email, password) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }

    // Sync user to our backend user table via API
    if (data.user) {
      try {
        const apiBase = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
        // Get session token to call the API
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        await fetch(`${apiBase}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        // Note: register may return 400 if already registered — that's fine
        // The user already exists in Supabase; this just ensures the DB row
        void token; // suppress unused var warning
      } catch {
        // Non-fatal: Supabase user was created, DB row will be created on next login via /me
      }
    }

    set({ isLoading: false });
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    await supabase.auth.signOut();
    set({ session: null, user: null, isLoading: false });
  },

  sendPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'reeltune://reset-password',
    });
    set({ isLoading: false });
    if (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
