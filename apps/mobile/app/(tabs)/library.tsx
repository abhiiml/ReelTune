import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Modal, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { useSavedSongs } from '../../hooks/useSavedSongs';
import { usePlaylists } from '../../hooks/usePlaylists';
import { useUnsaveSong } from '../../hooks/useUnsaveSong';
import { SongRow } from '../../components/ui/SongRow';
import { PlaylistCard } from '../../components/ui/PlaylistCard';
import { AddToPlaylistModal } from '../../components/ui/AddToPlaylistModal';
import { Toast } from '../../components/ui/Toast';
import { LibraryBig, Trash2, ExternalLink, X, Plus, Music, PlusCircle } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { Song } from '@reeltune/types';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs');

  // Songs State
  const { data: songsData, isLoading: songsLoading, refetch: refetchSongs, isRefetching: isRefetchingSongs } = useSavedSongs();
  const { mutate: unsaveSong } = useUnsaveSong();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('Song removed');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'artist'>('recent');
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  // Playlists State
  const { data: playlistsData, isLoading: playlistsLoading, refetch: refetchPlaylists, isRefetching: isRefetchingPlaylists } = usePlaylists();

  const savedSongs = songsData?.value || [];
  const playlists = playlistsData || [];

  const sortedSongs = [...savedSongs].sort((a, b) => {
    if (sortBy === 'title') {
      return (a.song.title || '').localeCompare(b.song.title || '');
    }
    if (sortBy === 'artist') {
      const artistA = a.song.artists[0] || '';
      const artistB = b.song.artists[0] || '';
      return artistA.localeCompare(artistB);
    }
    return 0;
  });

  const handleMenuPress = (song: Song) => {
    setSelectedSong(song);
  };

  const handleUnsave = () => {
    if (!selectedSong?.id) return;
    unsaveSong(selectedSong.id, {
      onSuccess: () => {
        setSelectedSong(null);
        setToastMsg('Song removed from library');
        setShowToast(true);
      }
    });
  };

  const handlePlaySpotify = async () => {
    if (!selectedSong?.spotifyId) return;
    const url = `https://open.spotify.com/track/${selectedSong.spotifyId}`;
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
    const url = selectedSong?.youtubeId 
      ? `https://music.youtube.com/watch?v=${selectedSong.youtubeId}`
      : `https://music.youtube.com/search?q=${encodeURIComponent(`${selectedSong?.title} ${selectedSong?.artists[0]}`)}`;
    
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.error(e);
    }
  };

  const renderSongs = () => (
    <>
      {savedSongs.length > 0 && (
        <View style={styles.sortContainer}>
          <Pressable 
            style={[styles.sortPill, sortBy === 'recent' && styles.sortPillActive]}
            onPress={() => setSortBy('recent')}
          >
            <Text style={[styles.sortPillText, sortBy === 'recent' && styles.sortPillTextActive]}>Recent</Text>
          </Pressable>
          <Pressable 
            style={[styles.sortPill, sortBy === 'title' && styles.sortPillActive]}
            onPress={() => setSortBy('title')}
          >
            <Text style={[styles.sortPillText, sortBy === 'title' && styles.sortPillTextActive]}>Title</Text>
          </Pressable>
          <Pressable 
            style={[styles.sortPill, sortBy === 'artist' && styles.sortPillActive]}
            onPress={() => setSortBy('artist')}
          >
            <Text style={[styles.sortPillText, sortBy === 'artist' && styles.sortPillTextActive]}>Artist</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={sortedSongs}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetchingSongs} onRefresh={refetchSongs} tintColor={Colors.accent} />
        }
        contentContainerStyle={savedSongs.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={
          !songsLoading ? (
            <View style={styles.emptyState}>
              <LibraryBig size={64} color={Colors.textMuted} strokeWidth={1} />
              <Text style={styles.emptyTitle}>No songs yet</Text>
              <Text style={styles.emptySubtitle}>Discover and save songs you love.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <SongRow 
            song={item.song} 
            onPress={() => router.push(`/song/${item.song.id}` as never)}
            onMenuPress={() => handleMenuPress(item.song)}
          />
        )}
      />
    </>
  );

  const renderPlaylists = () => (
    <FlatList
      data={playlists}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.playlistRow}
      refreshControl={
        <RefreshControl refreshing={isRefetchingPlaylists} onRefresh={refetchPlaylists} tintColor={Colors.accent} />
      }
      contentContainerStyle={[styles.listContainer, { paddingHorizontal: Spacing.base, paddingTop: Spacing.md }]}
      ListHeaderComponent={
        <Pressable 
          style={styles.newPlaylistBtn} 
          onPress={() => router.push('/playlist/create' as never)}
        >
          <Plus size={24} color={Colors.accent} />
          <Text style={styles.newPlaylistText}>New Playlist</Text>
        </Pressable>
      }
      ListEmptyComponent={
        !playlistsLoading ? (
          <View style={[styles.emptyState, { marginTop: 0 }]}>
            <Music size={64} color={Colors.textMuted} strokeWidth={1} />
            <Text style={styles.emptyTitle}>No playlists</Text>
            <Text style={styles.emptySubtitle}>Create a playlist to organize your songs.</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <PlaylistCard 
          playlist={item} 
          onPress={() => {
             router.push(`/playlist/${item.id}` as never);
          }}
        />
      )}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Toast 
        visible={showToast} 
        message={toastMsg} 
        onHide={() => setShowToast(false)} 
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        
        {/* Top Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'songs' && styles.tabButtonActive]}
            onPress={() => setActiveTab('songs')}
          >
            <Text style={[styles.tabText, activeTab === 'songs' && styles.tabTextActive]}>Songs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'playlists' && styles.tabButtonActive]}
            onPress={() => setActiveTab('playlists')}
          >
            <Text style={[styles.tabText, activeTab === 'playlists' && styles.tabTextActive]}>Playlists</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'songs' ? renderSongs() : renderPlaylists()}

      {/* Bottom Sheet Menu for Songs */}
      <Modal
        visible={!!selectedSong}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSong(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedSong(null)} />
          <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle} numberOfLines={1}>{selectedSong?.title}</Text>
                <Text style={styles.sheetSubtitle} numberOfLines={1}>{selectedSong?.artists?.join(', ')}</Text>
              </View>
              <Pressable onPress={() => setSelectedSong(null)} style={styles.closeBtn}>
                <X size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>
            
            <View style={styles.sheetActions}>
              <Pressable style={styles.actionRow} onPress={() => setShowAddToPlaylist(true)}>
                <PlusCircle size={24} color={Colors.textPrimary} />
                <Text style={styles.actionText}>Add to Playlist</Text>
              </Pressable>

              <Pressable style={styles.actionRow} onPress={handleUnsave}>
                <Trash2 size={24} color={Colors.error} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Remove from Library</Text>
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

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        visible={showAddToPlaylist}
        songId={selectedSong?.id || null}
        onClose={() => {
          setShowAddToPlaylist(false);
          setSelectedSong(null);
        }}
        onSuccess={(playlistName) => {
          setToastMsg(`Added to ${playlistName}`);
          setShowToast(true);
          setSelectedSong(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.btn,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.btn - 4,
  },
  tabButtonActive: {
    backgroundColor: Colors.bgPrimary,
  },
  tabText: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sortPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  sortPillActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  sortPillText: {
    ...Typography.small,
    fontFamily: 'Manrope_500Medium',
    color: Colors.textSecondary,
  },
  sortPillTextActive: {
    color: Colors.bgPrimary,
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  playlistRow: {
    justifyContent: 'space-between',
  },
  newPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.btn,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
  },
  newPlaylistText: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: -80, // visual center offset
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
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
  },
});
