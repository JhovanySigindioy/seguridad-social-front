import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api/axios-instance';
import type { Company, CreateCompanyDTO } from '../types/company.types';

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async (): Promise<Company[]> => {
      const { data } = await api.get('/companies');
      return data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateCompanyDTO): Promise<Company> => {
      const { data } = await api.post('/companies', formData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['affiliations', 'form-data'] });
    },
  });
};
