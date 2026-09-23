import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fetchApi('/users/me', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
