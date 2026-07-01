export interface Office {
  id: number;
  agency_id: number;
  name: string;
  address: string | null;
  logo_url: string | null;
  is_active: number | boolean;
}

export interface CreateOfficeDTO {
  name: string;
  address?: string;
  logo_url?: string;
}
