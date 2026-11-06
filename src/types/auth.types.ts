// Tipos del usuario autenticado — espejo del contrato del backend
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  agency_id: number;
  agency_logo_url?: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  offices: number[];
  expiresAt: string;
}
