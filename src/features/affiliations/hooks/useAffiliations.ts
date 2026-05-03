import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api/axios-instance';
import type { AffiliationItem } from '../types/affiliation.types';

export const useAffiliations = () => {
  return useQuery({
    queryKey: ['affiliations'],
    queryFn: async (): Promise<AffiliationItem[]> => {
      const { data } = await api.get('/affiliations');
      return data.data.items;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

export const useAffiliationFormData = () => {
  return useQuery({
    queryKey: ['affiliations', 'form-data'],
    queryFn: async () => {
      const { data } = await api.get('/affiliations/form-data');
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};

export const useCreateAffiliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/affiliations', formData);
      return data;
    },
    onSuccess: () => {
      // Invalidate query to refresh the table
      queryClient.invalidateQueries({ queryKey: ['affiliations'] });
    },
  });
};
