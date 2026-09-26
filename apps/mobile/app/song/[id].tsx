import { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable, Modal } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { useSong } from '../../hooks/useSong';
import { useSaveSong } from '../../hooks/useSaveSong';
import { AddToPlaylistModal } from '../../components/ui/AddToPlaylistModal';
import { DuplicateSaveModal } from '../../components/ui/DuplicateSaveModal';
import { useToastStore } from '../../store/useToastStore';
import { Heart, ExternalLink, ChevronLeft, X } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}

export default function SongDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { data: song, isLoading, error } = useSong(id as string);
  const { mutate: saveSong } = useSaveSong();

  const [isSavedLocal, setIsSavedLocal] = useState(false);
  const { showToast } = useToastStore();
  
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);


  const handlePlaySpotify = async () => {
    if (!song?.spotifyId) return;
    const url = `https://open.spotify.com/track/${song.spotifyId}`;
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
    const url = song?.youtubeId 
      ? `https://music.youtube.com/watch?v=${song.youtubeId}`
      : `https://music.youtube.com/search?q=${encodeURIComponent(`${song?.title} ${song?.artists[0]}`)}`;
    
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveToggle = () => {
    if (!song?.id) return;
    
    // Optimistic UI update
    setIsSavedLocal(true);

    saveSong(song.id, {
      onSuccess: (data) => {
        if (data.alreadySaved) {
          setShowDuplicateModal(true);
        } else {
          showToast('Song saved!', 'success');
        }
      },
      onError: () => {
        // Revert on error
        setIsSavedLocal(false);
      },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (error || !song) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load song details.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Duplicate Modal */}
      <DuplicateSaveModal
        visible={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        onAddToPlaylist={() => setShowAddToPlaylist(true)}
      />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        visible={showAddToPlaylist}
        songId={song.id}
        onClose={() => setShowAddToPlaylist(false)}
        onSuccess={(playlistName) => {
          showToast(`Added to ${playlistName}`, 'success');
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <ChevronLeft size={28} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.content}>
        {/* Artwork */}
        <View style={styles.artworkContainer}>
          {song.artwork ? (
            <Image source={{ uri: song.artwork }} style={styles.artwork} />
          ) : (
            <View style={styles.placeholderArtwork} />
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>{song.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{song.artists.join(', ')}</Text>
          
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{song.album}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{formatDuration(song.duration)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton, 
              isSavedLocal ? styles.secondaryAction : styles.primaryAction, 
              pressed && styles.pressed
            ]} 
            onPress={isSavedLocal ? () => setShowDuplicateModal(true) : handleSaveToggle}
          >
            <Heart size={20} color={isSavedLocal ? Colors.accent : Colors.bgPrimary} fill={isSavedLocal ? Colors.accent : 'transparent'} />
            <Text style={isSavedLocal ? styles.secondaryActionText : styles.primaryActionText}>
              {isSavedLocal ? 'Saved in Library' : 'Save to Library'}
            </Text>
          </Pressable>
          
          <Pressable 
            style={({ pressed }) => [styles.actionButton, styles.secondaryAction, pressed && styles.pressed]} 
            onPress={() => setShowAddToPlaylist(true)}
          >
            <Text style={styles.secondaryActionText}>Add to Playlist...</Text>
          </Pressable>
          
          <Pressable 
            style={({ pressed }) => [styles.actionButton, styles.secondaryAction, pressed && styles.pressed]} 
            onPress={handlePlaySpotify}
          >
            <ExternalLink size={20} color={Colors.spotify} />
            <Text style={[styles.secondaryActionText, { color: Colors.spotify }]}>Spotify</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.actionButton, styles.secondaryAction, pressed && styles.pressed]} 
            onPress={handlePlayYouTube}
          >
            <ExternalLink size={20} color={Colors.youtube} />
            <Text style={[styles.secondaryActionText, { color: Colors.youtube }]}>YouTube</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    height: 56,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  iconButton: {
    padding: Spacing.sm,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  artworkContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.card,
    overflow: 'hidden',
    backgroundColor: Colors.cardElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: Spacing.xl,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  placeholderArtwork: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.cardElevated,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  artist: {
    ...Typography.h3,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  metaDot: {
    color: Colors.textMuted,
  },
  actionsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: Radius.btn,
    gap: Spacing.sm,
  },
  primaryAction: {
    backgroundColor: Colors.accent,
  },
  primaryActionText: {
    ...Typography.h3,
    color: Colors.bgPrimary,
  },
  secondaryAction: {
    backgroundColor: Colors.cardElevated,
  },
  secondaryActionText: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  pressed: {
    opacity: 0.8,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    padding: Spacing.base,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.btn,
  },
  backBtnText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Radius.sheet,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
