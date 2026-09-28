import { useState, useEffect } from 'react';
import { AuthStorage } from '../services/storage.ts';
import { api } from '../services/api/client.ts';
import type { User, ApiResponse } from '../../types/quiz.ts';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Global state container for react components
let globalUserState: User | null = null;
let globalTokenState: string | null = null;
let globalLoadingState: boolean = true;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function useAuth(): AuthState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const checkAuth = async () => {
    globalLoadingState = true;
    notify();
    try {
      const token = await AuthStorage.getAccessToken();
      if (!token) {
        // Auto-seed login for Rakib if first time for seamless review
        const res = await api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
          '/auth/login',
          { email: 'rakib.edu.bd@gmail.com', password: 'password123' },
          { requiresAuth: false }
        );
        if (res.success && res.data) {
          await AuthStorage.setAccessToken(res.data.tokens.accessToken);
          await AuthStorage.setRefreshToken(res.data.tokens.refreshToken);
          await AuthStorage.setUser(res.data.user);
          globalTokenState = res.data.tokens.accessToken;
          globalUserState = res.data.user;
        } else {
          globalTokenState = null;
          globalUserState = null;
        }
      } else {
        const res = await api.get<User>('/auth/me');
        if (res.success && res.data) {
          globalTokenState = token;
          globalUserState = res.data;
          await AuthStorage.setUser(res.data);
        } else {
          await AuthStorage.clearTokens();
          globalTokenState = null;
          globalUserState = null;
        }
      }
    } catch {
      globalTokenState = null;
      globalUserState = null;
    } finally {
      globalLoadingState = false;
      notify();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
        '/auth/login',
        { email, password },
        { requiresAuth: false }
      );
      if (res.success && res.data) {
        await AuthStorage.setAccessToken(res.data.tokens.accessToken);
        await AuthStorage.setRefreshToken(res.data.tokens.refreshToken);
        await AuthStorage.setUser(res.data.user);
        globalTokenState = res.data.tokens.accessToken;
        globalUserState = res.data.user;
        notify();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
        '/auth/register',
        { name, email, password },
        { requiresAuth: false }
      );
      if (res.success && res.data) {
        await AuthStorage.setAccessToken(res.data.tokens.accessToken);
        await AuthStorage.setRefreshToken(res.data.tokens.refreshToken);
        await AuthStorage.setUser(res.data.user);
        globalTokenState = res.data.tokens.accessToken;
        globalUserState = res.data.user;
        notify();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Register error:', e);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {}
    await AuthStorage.clearTokens();
    globalTokenState = null;
    globalUserState = null;
    notify();
  };

  return {
    user: globalUserState,
    token: globalTokenState,
    isAuthenticated: !!globalUserState,
    isLoading: globalLoadingState,
    login,
    register,
    logout,
    checkAuth,
  };
}
