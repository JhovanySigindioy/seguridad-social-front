// Tipos del usuario autenticado — espejo del contrato del backend
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  agency_id: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  offices: number[];
}
