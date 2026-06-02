import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api/axios-instance';
import type { Client, CreateClientDTO, UpdateClientDTO } from '../types/client.types';

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async (): Promise<Client[]> => {
      const { data } = await api.get('/clients');
      return data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useClientFormData = () => {
  return useQuery({
    queryKey: ['clients', 'form-data'],
    queryFn: async () => {
      const [documentTypesRes, officesRes] = await Promise.all([
        api.get('/clients/document-types'),
        api.get('/offices'),
      ]);
      return {
        documentTypes: documentTypesRes.data.data,
        offices: officesRes.data.data,
      };
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateClientDTO) => {
      const { data } = await api.post('/clients', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['affiliations', 'form-data'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: UpdateClientDTO & { id: number }) => {
      const { data } = await api.put(`/clients/${id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/clients/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
