import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api/axios-instance';
import type { CreateOfficeDTO, Office } from '../types/office.types';

export const useAdminOffices = () => {
  return useQuery({
    queryKey: ['admin-offices'],
    queryFn: async (): Promise<Office[]> => {
      const { data } = await api.get('/offices');
      return data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateOfficeDTO): Promise<Office> => {
      const { data } = await api.post('/offices', formData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offices'] });
    },
  });
};
