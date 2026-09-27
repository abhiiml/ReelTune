import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export interface UserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  publicPlaylists: Array<{
    id: string;
    name: string;
    description: string | null;
    isPrivate: boolean;
    createdAt: string;
    updatedAt: string;
    songCount: number;
  }>;
}

export interface UserBasic {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export function useUserProfile(id: string) {
  return useQuery<UserProfile>({
    queryKey: ['user', id],
    queryFn: () => fetchApi<UserProfile>(`/users/${id}`),
    enabled: !!id,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => fetchApi(`/users/${userId}/follow`, { method: 'POST' }),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => fetchApi(`/users/${userId}/follow`, { method: 'DELETE' }),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

export function useFollowers(userId: string) {
  return useQuery<UserBasic[]>({
    queryKey: ['followers', userId],
    queryFn: () => fetchApi<UserBasic[]>(`/users/${userId}/followers`),
    enabled: !!userId,
  });
}

export function useFollowing(userId: string) {
  return useQuery<UserBasic[]>({
    queryKey: ['following', userId],
    queryFn: () => fetchApi<UserBasic[]>(`/users/${userId}/following`),
    enabled: !!userId,
  });
}

export function usePlaylistLikes(playlistId: string) {
  return useQuery<UserBasic[]>({
    queryKey: ['playlist-likes', playlistId],
    queryFn: () => fetchApi<UserBasic[]>(`/playlists/${playlistId}/likes`),
    enabled: !!playlistId,
  });
}

export function useLikePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (playlistId: string) => fetchApi(`/playlists/${playlistId}/like`, { method: 'POST' }),
    onSuccess: (_, playlistId) => {
      queryClient.invalidateQueries({ queryKey: ['playlist-likes', playlistId] });
    },
  });
}

export function useUnlikePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (playlistId: string) => fetchApi(`/playlists/${playlistId}/like`, { method: 'DELETE' }),
    onSuccess: (_, playlistId) => {
      queryClient.invalidateQueries({ queryKey: ['playlist-likes', playlistId] });
    },
  });
}
