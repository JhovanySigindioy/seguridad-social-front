import { create } from 'zustand';
import type { AffiliateAuthUser } from '../types/affiliate-auth.types';

interface AffiliateAuthState {
  token: string | null;
  user: AffiliateAuthUser | null;
  setAuth: (token: string, user: AffiliateAuthUser) => void;
  logout: () => void;
}

const safeParse = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

const storedUser = safeParse<AffiliateAuthUser | null>('affiliate_user', null);

if (!storedUser) {
  localStorage.removeItem('affiliate_token');
  localStorage.removeItem('affiliate_user');
}

export const useAffiliateAuthStore = create<AffiliateAuthState>((set) => ({
  token: storedUser ? localStorage.getItem('affiliate_token') : null,
  user: storedUser,
  setAuth: (token, user) => {
    localStorage.setItem('affiliate_token', token);
    localStorage.setItem('affiliate_user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('affiliate_token');
    localStorage.removeItem('affiliate_user');
    set({ token: null, user: null });
  },
}));
