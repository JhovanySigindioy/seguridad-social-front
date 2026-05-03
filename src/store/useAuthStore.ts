import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  offices: number[]; // IDs de oficinas permitidas
  activeOfficeId: number | null; // ID de la oficina seleccionada
  setAuth: (token: string, user: any, offices: number[]) => void;
  setActiveOffice: (officeId: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  offices: JSON.parse(localStorage.getItem('offices') || '[]'),
  activeOfficeId: JSON.parse(localStorage.getItem('activeOfficeId') || 'null'),
  
  setAuth: (token, user, offices) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('offices', JSON.stringify(offices));
    
    // Si tiene solo una oficina y no es admin, asignarla automáticamente
    let autoOffice = null;
    if (offices.length === 1 && user.role !== 'admin') {
      autoOffice = offices[0];
      localStorage.setItem('activeOfficeId', JSON.stringify(autoOffice));
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
