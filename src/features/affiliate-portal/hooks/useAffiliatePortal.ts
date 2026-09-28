import { useQuery } from '@tanstack/react-query';
import affiliateApi from '../../../services/api/affiliate-axios';
import type { AffiliateAuthUser } from '../../../types/affiliate-auth.types';
import type { AffiliationItem } from '../../affiliations/types/affiliation.types';
import type { AffiliateDocument } from '../../affiliate-documents/types/affiliate-document.types';

export const useAffiliateMe = (enabled = true) => {
  return useQuery({
    queryKey: ['affiliate', 'me'],
    queryFn: async (): Promise<AffiliateAuthUser> => {
      const { data } = await affiliateApi.get('/affiliate/auth/me');
      return data.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAffiliateAffiliations = (enabled = true) => {
  return useQuery({
    queryKey: ['affiliate', 'affiliations'],
    queryFn: async (): Promise<AffiliationItem[]> => {
      const { data } = await affiliateApi.get('/affiliate/affiliations');
      return data.data.items;
    },
    enabled,
    staleTime: 1000 * 60,
  });
};

export const useAffiliateDocuments = (enabled = true) => {
  return useQuery({
    queryKey: ['affiliate', 'documents'],
    queryFn: async (): Promise<AffiliateDocument[]> => {
      const { data } = await affiliateApi.get('/affiliate/documents');
      return data.data;
    },
    enabled,
    staleTime: 1000 * 60,
  });
};
