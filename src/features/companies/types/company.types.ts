export interface Company {
  id: number;
  agency_id: number;
  name: string;
  nit: string;
  email: string | null;
  is_active: number | boolean;
}

export interface CreateCompanyDTO {
  name: string;
  nit: string;
  email?: string;
}
