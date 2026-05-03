export interface Client {
  id: number;
  document_type_id: number;
  document_type_name?: string;
  first_name: string;
  second_name?: string | null;
  first_lastname: string;
  second_lastname?: string | null;
  full_name?: string;
  identification: string;
  email: string | null;
  office_id: number;
  office_name?: string;
  created_at: string;
}

export interface CreateClientDTO {
  document_type_id: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname?: string;
  identification: string;
  email?: string;
  office_id: number;
}

export interface UpdateClientDTO {
  document_type_id: number;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname?: string;
  identification: string;
  email?: string;
}
