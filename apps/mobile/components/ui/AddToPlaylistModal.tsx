import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Lock, Plus } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { usePlaylists, type Playlist } from '../../hooks/usePlaylists';
import { useAddSongToPlaylist } from '../../hooks/useAddSongToPlaylist';
import { useRouter } from 'expo-router';

interface AddToPlaylistModalProps {
  visible: boolean;
  songId: string | null;
  onClose: () => void;
  onSuccess: (playlistName: string) => void;
}

export function AddToPlaylistModal({ visible, songId, onClose, onSuccess }: AddToPlaylistModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: playlists, isLoading } = usePlaylists();
  const { mutate: addSong, isPending } = useAddSongToPlaylist();

  const handleSelect = (playlist: Playlist) => {
    if (!songId || isPending) return;
    addSong(
      { playlistId: playlist.id, songId },
      {
        onSuccess: () => {
          onSuccess(playlist.name);
          onClose();
        },
        onError: (err: unknown) => {
          console.error('Failed to add song:', err);
          // If conflict, we could show error, but keeping it simple.
          onClose();
        }
      }
    );
  };

  const renderPlaylist = ({ item }: { item: Playlist }) => (
    <Pressable 
      style={({ pressed }) => [styles.playlistRow, pressed && styles.pressed]}
      onPress={() => handleSelect(item)}
      disabled={isPending}
    >
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName} numberOfLines={1}>{item.name}</Text>
        {item.isPrivate && <Lock size={12} color={Colors.textMuted} />}
      </View>
      <Text style={styles.songCount}>
        {item._count?.songs || 0} {(item._count?.songs === 1) ? 'song' : 'songs'}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to Playlist</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.loader} />
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              ListHeaderComponent={
                <Pressable 
                  style={styles.newPlaylistBtn}
                  onPress={() => {
                    onClose();
                    router.push('/playlist/create' as never);
                  }}
                >
                  <Plus size={20} color={Colors.accent} />
                  <Text style={styles.newPlaylistText}>New Playlist</Text>
                </Pressable>
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>You haven't created any playlists yet.</Text>
              }
              renderItem={renderPlaylist}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingTop: Spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardElevated,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  loader: {
    margin: Spacing.xl,
  },
  list: {
    padding: Spacing.lg,
  },
  newPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardElevated,
  },
  newPlaylistText: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.accent,
  },
  playlistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.md,
  },
  playlistName: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  songCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
