import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api/axios-instance';
import type { AffiliationItem, PaymentStatus } from '../types/affiliation.types';

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

export const useUpdateAffiliationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payment_status }: { id: number; payment_status: PaymentStatus }) => {
      const { data } = await api.patch(`/affiliations/${id}/status`, { payment_status });
      return data.data;
    },
    onMutate: async ({ id, payment_status }) => {
      await queryClient.cancelQueries({ queryKey: ['affiliations'] });
      const previous = queryClient.getQueryData<AffiliationItem[]>(['affiliations']);
      const gov_record_at = payment_status === 'Pagado' ? new Date().toISOString() : null;

      queryClient.setQueryData<AffiliationItem[]>(['affiliations'], old =>
        old?.map(item => item.id === id ? { ...item, payment_status, gov_record_at } : item)
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['affiliations'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliations'] });
    },
  });
};

export const useUpdateAffiliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: any) => {
      const { data } = await api.put(`/affiliations/${id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliations'] });
    },
  });
};
