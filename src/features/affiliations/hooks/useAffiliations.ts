import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api/axios-instance';
import type { AffiliationItem, PaymentStatus } from '../types/affiliation.types';

export const useAffiliations = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ['affiliations', month, year],
    queryFn: async (): Promise<AffiliationItem[]> => {
      const { data } = await api.get('/affiliations', { 
        params: { 
          month, 
          year,
          _t: Date.now() // Cache busting
        } 
      });
      return data.data.items;
    },
    staleTime: 0, // Force fresh data
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

export const useLatestAffiliationByClient = (clientId: string | null) => {
  return useQuery({
    queryKey: ['affiliations', 'latest', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data } = await api.get(`/affiliations/latest-by-client/${clientId}`);
      return data.data;
    },
    enabled: !!clientId,
    staleTime: 0, // Always fetch fresh to ensure we have the absolute latest if they just closed one
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
    mutationFn: async ({ id, payment_status, month, year }: { id: number; payment_status: PaymentStatus; month: number; year: number }) => {
      const { data } = await api.patch(`/affiliations/${id}/status`, { payment_status, month, year });
      return data.data;
    },
    onMutate: async ({ id, payment_status, month, year }) => {
      const queryKey = ['affiliations', month, year];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AffiliationItem[]>(queryKey);
      const gov_record_at = payment_status === 'Pagado' ? new Date().toISOString() : null;

      queryClient.setQueryData<AffiliationItem[]>(queryKey, old =>
        old?.map(item => (item.id === id) ? { ...item, payment_status, gov_record_at } : item)
      );

      return { previous };
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['affiliations', variables.month, variables.year], context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['affiliations', variables.month, variables.year] });
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

export const useDailyAffiliations = (date: string, officeId?: number) => {
  return useQuery({
    queryKey: ['affiliations', 'daily', date, officeId],
    queryFn: async () => {
      const { data } = await api.get('/affiliations/daily', {
        params: { date, office_id: officeId, _t: Date.now() },
      });
      return data.data.items;
    },
    staleTime: 0,
  });
};

export const useCloseAffiliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, withdrawal_reason, withdrawal_observations }: {
      id: number;
      withdrawal_reason: 'Voluntario' | 'FinContrato' | 'Licencia' | 'Otro';
      withdrawal_observations?: string;
    }) => {
      const { data } = await api.patch(`/affiliations/${id}/close`, {
        withdrawal_reason,
        withdrawal_observations,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliations'] });
    },
  });
};
