import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api/axios-instance';
import type { AffiliateAccountsResponse, CreateAffiliateAccountResponse } from '../types/affiliate-account.types';

interface Filters {
  officeId?: number;
  search?: string;
  status?: string;
  paidOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export const useAffiliateAccounts = (filters: Filters) => {
  return useQuery({
    queryKey: ['affiliate-accounts', filters],
    queryFn: async (): Promise<AffiliateAccountsResponse> => {
      const { data } = await api.get('/affiliate-accounts', {
        params: {
          office_id: filters.officeId,
          search: filters.search || undefined,
          status: filters.status === 'all' ? undefined : filters.status,
          paid_only: filters.paidOnly ? 'true' : 'false',
          page: filters.page,
          page_size: filters.pageSize,
        },
      });
      return data.data as AffiliateAccountsResponse;
    },
    staleTime: 30_000,
  });
};

export const useCreateAffiliateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, email }: { clientId: number; email?: string }) => {
      const { data } = await api.post('/affiliate-accounts', {
        client_id: clientId,
        ...(email ? { email } : {}),
      });
      return data.data as CreateAffiliateAccountResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-accounts'] });
    },
  });
};

export const useResetAffiliateAccountPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: number) => {
      const { data } = await api.post(`/affiliate-accounts/${accountId}/reset-password`);
      return data.data as CreateAffiliateAccountResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-accounts'] });
    },
  });
};
