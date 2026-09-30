import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api/axios-instance';

export interface PortalServiceStatus {
  status: 'pending' | 'active' | 'suspended';
  enabled: boolean;
  monthly_price: number;
  accepted_at?: string | null;
  accepted_by_name?: string | null;
  accepted_by_email?: string | null;
  terms_version: string;
}

export const usePortalServiceStatus = () => useQuery({
  queryKey: ['portal-service-status'],
  queryFn: async (): Promise<PortalServiceStatus> => {
    const { data } = await api.get('/portal-service/status');
    return data.data as PortalServiceStatus;
  },
  staleTime: 30_000,
});

export const useActivatePortalService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<PortalServiceStatus> => {
      const { data } = await api.post('/portal-service/activate');
      return data.data as PortalServiceStatus;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['portal-service-status'], data);
      queryClient.invalidateQueries({ queryKey: ['affiliate-accounts'] });
    },
  });
};
