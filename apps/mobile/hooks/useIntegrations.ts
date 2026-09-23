import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import type { ConnectedAccount } from '@reeltune/types';

export function useIntegrations() {
  return useQuery<ConnectedAccount[]>({
    queryKey: ['integrations'],
    queryFn: () => fetchApi<ConnectedAccount[]>('/integrations'),
  });
}
