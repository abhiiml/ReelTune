import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { usePlaylist, type PlaylistSong } from '../../hooks/usePlaylist';
import { useRemoveSongFromPlaylist } from '../../hooks/useRemoveSongFromPlaylist';
import { useReorderPlaylistSongs } from '../../hooks/useReorderPlaylistSongs';
import { SongRow } from '../../components/ui/SongRow';
import { useToastStore } from '../../store/useToastStore';
import { SyncProgressModal } from '../../components/ui/SyncProgressModal';
import { ArrowLeft, Lock, Music, Trash2, ArrowUp, ArrowDown, ExternalLink, X, RefreshCw, Share2 } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useSyncPlaylistToSpotify } from '../../hooks/useSyncPlaylistToSpotify';
import { useSyncPlaylistToYouTube } from '../../hooks/useSyncPlaylistToYouTube';

export default function PlaylistDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: playlist, isLoading } = usePlaylist(id);
  const { mutate: removeSong } = useRemoveSongFromPlaylist();
  const { mutate: reorderSongs } = useReorderPlaylistSongs();
  const { mutate: syncSpotify, isPending: isSyncingSpotify } = useSyncPlaylistToSpotify();
  const { mutate: syncYouTube, isPending: isSyncingYouTube } = useSyncPlaylistToYouTube();

  const [selectedItem, setSelectedItem] = useState<PlaylistSong | null>(null);
  const { showToast } = useToastStore();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [showSyncOptions, setShowSyncOptions] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: Colors.textSecondary }}>Playlist not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: Spacing.md }}>
          <Text style={{ color: Colors.accent }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const songs = playlist.songs || [];

  const handleMenuPress = (item: PlaylistSong) => {
    setSelectedItem(item);
  };

  const handleRemove = () => {
    if (!selectedItem) return;
    removeSong(
      { playlistId: playlist.id, songId: selectedItem.songId },
      {
        onSuccess: () => {
          setSelectedItem(null);
          showToast('Song removed', 'success');
        }
      }
    );
  };

  const handleMove = (direction: 'up' | 'down') => {
    if (!selectedItem) return;
    
    const currentIndex = songs.findIndex((s) => s.id === selectedItem.id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= songs.length) return; // Can't move further
    
    // Create new array of IDs
    const newSongs = [...songs];
    // Swap
    const temp = newSongs[currentIndex];
    newSongs[currentIndex] = newSongs[newIndex];
    newSongs[newIndex] = temp;
    
    const songIds = newSongs.map((s) => s.songId);
    
    reorderSongs(
      { playlistId: playlist.id, songIds },
      {
        onSuccess: () => {
          setSelectedItem(null);
        }
      }
    );
  };

  const handlePlaySpotify = async () => {
    if (!selectedItem?.song?.spotifyId) return;
    const url = `https://open.spotify.com/track/${selectedItem.song.spotifyId}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayYouTube = async () => {
    const s = selectedItem?.song;
    if (!s) return;
    const url = s.youtubeId 
      ? `https://music.youtube.com/watch?v=${s.youtubeId}`
      : `https://music.youtube.com/search?q=${encodeURIComponent(`${s.title} ${s.artists[0]}`)}`;
    
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncSpotify = () => {
    setShowSyncOptions(false);
    syncSpotify(playlist.id, {
      onSuccess: (data) => setActiveJobId(data.jobId),
      onError: (err: Error) => {
        showToast(err.message || 'Failed to sync to Spotify', 'error');
      }
    });
  };

  const handleSyncYouTube = () => {
    setShowSyncOptions(false);
    syncYouTube(playlist.id, {
      onSuccess: (data) => setActiveJobId(data.jobId),
      onError: (err: Error) => {
        showToast(err.message || 'Failed to sync to YouTube', 'error');
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={songs.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListHeaderComponent={
          <View style={styles.playlistInfo}>
            <View style={styles.artworkContainer}>
               <Music size={64} color={Colors.textMuted} />
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.playlistTitle}>{playlist.name}</Text>
              {playlist.isPrivate && <Lock size={16} color={Colors.textMuted} />}
            </View>
            {!!playlist.description && (
              <Text style={styles.playlistDescription}>{playlist.description}</Text>
            )}
            <Text style={styles.playlistCount}>
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </Text>

            <View style={styles.actionButtonsRow}>
              {songs.length > 0 && (
                <Pressable 
                  style={styles.syncButton} 
                  onPress={() => setShowSyncOptions(true)}
                  disabled={isSyncingSpotify || isSyncingYouTube}
                >
                  <RefreshCw size={16} color="#fff" />
                  <Text style={styles.syncButtonText}>Sync Playlist</Text>
                </Pressable>
              )}
              <Pressable
                style={styles.shareButton}
                onPress={async () => {
                  const webUrl = `https://reeltune.app/playlist/${playlist.id}`;
                  try {
                    await Share.share({
                      title: playlist.name,
                      message: `Check out my playlist "${playlist.name}" on ReelTune: ${webUrl}`,
                      url: webUrl,
                    });
                  } catch {
                    showToast('Could not share playlist', 'error');
                  }
                }}
              >
                <Share2 size={16} color={Colors.textPrimary} />
                <Text style={styles.shareButtonText}>Share</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>It's quiet here...</Text>
            <Text style={styles.emptySubtitle}>Find some songs and add them to this playlist.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <SongRow 
            song={item.song} 
            onPress={() => router.push(`/song/${item.song.id}` as never)}
            onMenuPress={() => handleMenuPress(item)}
          />
        )}
      />

      {/* Bottom Sheet Menu */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedItem(null)} />
          <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle} numberOfLines={1}>{selectedItem?.song?.title}</Text>
                <Text style={styles.sheetSubtitle} numberOfLines={1}>{selectedItem?.song?.artists?.join(', ')}</Text>
              </View>
              <Pressable onPress={() => setSelectedItem(null)} style={styles.closeBtn}>
                <X size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>
            
            <View style={styles.sheetActions}>
              <Pressable style={styles.actionRow} onPress={handleRemove}>
                <Trash2 size={24} color={Colors.error} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Remove from Playlist</Text>
              </Pressable>

              <Pressable style={styles.actionRow} onPress={() => handleMove('up')}>
                <ArrowUp size={24} color={Colors.textPrimary} />
                <Text style={styles.actionText}>Move Up</Text>
              </Pressable>
              
              <Pressable style={styles.actionRow} onPress={() => handleMove('down')}>
                <ArrowDown size={24} color={Colors.textPrimary} />
                <Text style={styles.actionText}>Move Down</Text>
              </Pressable>

              <Pressable style={styles.actionRow} onPress={handlePlaySpotify}>
                <ExternalLink size={24} color={Colors.spotify} />
                <Text style={[styles.actionText, { color: Colors.spotify }]}>Play on Spotify</Text>
              </Pressable>

              <Pressable style={styles.actionRow} onPress={handlePlayYouTube}>
                <ExternalLink size={24} color={Colors.youtube} />
                <Text style={[styles.actionText, { color: Colors.youtube }]}>Play on YouTube</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <SyncProgressModal 
        jobId={activeJobId} 
        onClose={() => setActiveJobId(null)} 
      />

      {/* Sync Options Modal */}
      <Modal
        visible={showSyncOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSyncOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowSyncOptions(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Sync Playlist</Text>
                <Text style={styles.sheetSubtitle}>Choose a destination service</Text>
              </View>
              <Pressable onPress={() => setShowSyncOptions(false)} style={styles.closeBtn}>
                <X size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>
            
            <View style={styles.sheetActions}>
              <Pressable style={styles.actionRow} onPress={handleSyncSpotify}>
                <ExternalLink size={24} color={Colors.spotify} />
                <Text style={[styles.actionText, { color: Colors.textPrimary }]}>Spotify</Text>
              </Pressable>

              <Pressable style={styles.actionRow} onPress={handleSyncYouTube}>
                <ExternalLink size={24} color={Colors.youtube} />
                <Text style={[styles.actionText, { color: Colors.textPrimary }]}>YouTube Music</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
    width: 40,
  },
  playlistInfo: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardElevated,
    marginBottom: Spacing.md,
  },
  artworkContainer: {
    width: 160,
    height: 160,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  playlistTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  playlistDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  playlistCount: {
    ...Typography.small,
    color: Colors.accent,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.spotify,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 9999,
    gap: Spacing.xs,
  },
  syncButtonText: {
    ...Typography.body,
    color: '#fff',
    fontFamily: 'Manrope_700Bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardElevated,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 9999,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  shareButtonText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    padding: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardElevated,
  },
  sheetTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  sheetActions: {
    gap: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionText: {
    ...Typography.h3,
    fontFamily: 'Manrope_500Medium',
    color: Colors.textPrimary,
  },
});
