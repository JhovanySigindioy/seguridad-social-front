import { useQuery } from '@tanstack/react-query';
import api from '../services/api/axios-instance';

export interface DashboardStatsResponse {
  currentMonth: {
    total: number;
    paid: number;
    pending: number;
    inProcess: number;
  };
  overdue: {
    count: number;
    value: number;
  };
  expiringSoon: {
    count: number;
    value: number;
  };
  trendData: {
    month: number;
    year: number;
    value: number;
    count: number;
    paid: number;
    pending: number;
  }[];
  totalAffiliations: number;
}

export const useDashboardStats = (officeId?: number, month?: number, year?: number) => {
  return useQuery({
    queryKey: ['dashboard-stats', officeId, month, year],
    queryFn: async (): Promise<DashboardStatsResponse> => {
      const { data } = await api.get('/dashboard/stats', {
        params: { office_id: officeId, month, year }
      });
      return data;
    },
    staleTime: 0,
  });
};
