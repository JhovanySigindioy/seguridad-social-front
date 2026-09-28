import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api/axios-instance';
import type { AffiliateDocument, AffiliateDocumentFilters, UploadAffiliateDocumentPayload } from '../types/affiliate-document.types';

const buildQueryKey = (filters: AffiliateDocumentFilters) => [
  'affiliate-documents',
  filters.client_id ?? null,
  filters.affiliation_id ?? null,
  filters.monthly_payment_id ?? null,
] as const;

export const useAffiliateDocuments = (filters: AffiliateDocumentFilters, enabled = true) => {
  return useQuery({
    queryKey: buildQueryKey(filters),
    queryFn: async (): Promise<AffiliateDocument[]> => {
      const { data } = await api.get('/affiliate-documents', { params: filters });
      return data.data;
    },
    enabled,
    staleTime: 1000 * 30,
  });
};

export const useUploadAffiliateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UploadAffiliateDocumentPayload): Promise<AffiliateDocument> => {
      const formData = new FormData();
      formData.append('client_id', String(payload.client_id));
      formData.append('document_type', payload.document_type);
      formData.append('file', payload.file);

      if (payload.affiliation_id) {
        formData.append('affiliation_id', String(payload.affiliation_id));
      }

      if (payload.monthly_payment_id) {
        formData.append('monthly_payment_id', String(payload.monthly_payment_id));
      }

      if (payload.display_name?.trim()) {
        formData.append('display_name', payload.display_name.trim());
      }

      formData.append('is_visible_to_affiliate', payload.is_visible_to_affiliate === false ? '0' : '1');

      const { data } = await api.post('/affiliate-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return data.data;
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-documents'] });
      queryClient.setQueryData<AffiliateDocument[]>(
         buildQueryKey({
           client_id: document.client_id,
           affiliation_id: document.affiliation_id ?? undefined,
           monthly_payment_id: document.monthly_payment_id ?? undefined,
         }),
        (current) => current ? [document, ...current] : [document]
      );
    },
  });
};
