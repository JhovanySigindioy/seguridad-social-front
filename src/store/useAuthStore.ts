import { create } from 'zustand';
import type { AuthUser } from '../types/auth.types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  offices: number[]; // IDs de oficinas permitidas
  activeOfficeId: number | null; // ID de la oficina seleccionada
  setAuth: (token: string, user: AuthUser, offices: number[]) => void;
  setActiveOffice: (officeId: number) => void;
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

const storedUser = safeParse<AuthUser | null>('user', null);
const storedOffices = safeParse<unknown>('offices', []);
const storedActiveOfficeId = safeParse<unknown>('activeOfficeId', null);

const initialUser = storedUser && typeof storedUser === 'object' && typeof storedUser.role === 'string'
  ? storedUser
  : null;
const initialOffices = Array.isArray(storedOffices) ? storedOffices.filter((id): id is number => typeof id === 'number') : [];
const initialActiveOfficeId = typeof storedActiveOfficeId === 'number' ? storedActiveOfficeId : null;

if (!initialUser) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('offices');
  localStorage.removeItem('activeOfficeId');
} else if (initialUser.role === 'admin') {
  localStorage.removeItem('activeOfficeId');
}

export const useAuthStore = create<AuthState>((set) => ({
  token: initialUser ? localStorage.getItem('token') : null,
  user: initialUser,
  offices: initialOffices,
  activeOfficeId: initialUser?.role === 'admin' ? null : initialActiveOfficeId,
  
  setAuth: (token, user, offices) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('offices', JSON.stringify(offices));
    
    let autoOffice = null;
    if (user.role === 'admin') {
      localStorage.removeItem('activeOfficeId');
    } else if (offices.length === 1) {
      autoOffice = offices[0];
      localStorage.setItem('activeOfficeId', JSON.stringify(autoOffice));
    } else {
      localStorage.removeItem('activeOfficeId');
    }

    set({ token, user, offices, activeOfficeId: autoOffice });
  },

  setActiveOffice: (officeId) => {
    localStorage.setItem('activeOfficeId', JSON.stringify(officeId));
    set({ activeOfficeId: officeId });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('offices');
    localStorage.removeItem('activeOfficeId');
    set({ token: null, user: null, offices: [], activeOfficeId: null });
  }
}));
