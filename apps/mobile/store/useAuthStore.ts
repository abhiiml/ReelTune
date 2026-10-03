import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { API_URL } from '../lib/api';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
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
      const msg =
        error.message === 'Invalid login credentials'
          ? 'Invalid email or password. If you just created an account, please check your inbox to verify your email.'
          : error.message;
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
    // onAuthStateChange will update session/user automatically
    set({ isLoading: false });
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const redirectUrl = Linking.createURL('auth-callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        throw error;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          const urlStr = result.url;
          let code: string | null = null;
          let accessToken: string | null = null;
          let refreshToken: string | null = null;

          if (urlStr.includes('code=')) {
            const match = urlStr.match(/[?&]code=([^&]+)/);
            if (match) code = decodeURIComponent(match[1]);
          }
          if (urlStr.includes('access_token=')) {
            const match = urlStr.match(/[#&]access_token=([^&]+)/);
            if (match) accessToken = decodeURIComponent(match[1]);
          }
          if (urlStr.includes('refresh_token=')) {
            const match = urlStr.match(/[#&]refresh_token=([^&]+)/);
            if (match) refreshToken = decodeURIComponent(match[1]);
          }

          if (code) {
            const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeErr) throw exchangeErr;
          } else if (accessToken && refreshToken) {
            const { error: sessErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessErr) throw sessErr;
          }
        }
      }
      set({ isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or failed';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  signUp: async (name, email, password) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, full_name: name },
      },
    });
    if (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }

    // Sync user to our backend user table via API
    if (data.user) {
      try {
        await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
      } catch {
        // Non-fatal: user will be synced on first authenticated request
      }
    }

    set({ isLoading: false });
    return { user: data.user, session: data.session };
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

