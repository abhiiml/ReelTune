import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { Search, Sparkles, SlidersHorizontal, FolderPlus } from 'lucide-react-native';
import { useShareIntent } from 'expo-share-intent';
import { useRouter } from 'expo-router';
import { useIdentifyReel } from '../../hooks/useIdentifyReel';
import { useSaveSong } from '../../hooks/useSaveSong';
import { useDestinationPreferences } from '../../hooks/useDestinations';
import { useDestinationStore } from '../../store/useDestinationStore';
import type { IdentifyReelResponse } from '../../hooks/useIdentifyReel';
import { IdentificationResultModal } from '../../components/ui/IdentificationResultModal';
import { DuplicateSaveModal } from '../../components/ui/DuplicateSaveModal';
import { AddToPlaylistModal } from '../../components/ui/AddToPlaylistModal';

export default function SaveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const { mutate: identifyReel, isPending } = useIdentifyReel();
  const { mutate: saveSong } = useSaveSong();
  const { data: destPref } = useDestinationPreferences();
  const { activePlaylistName, activeProvider } = useDestinationStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState<IdentifyReelResponse | null>(null);
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [duplicateSongId, setDuplicateSongId] = useState('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (hasShareIntent && shareIntent) {
      const intentRecord = shareIntent as unknown as Record<string, string>;
      const incomingUrl = intentRecord.value || intentRecord.text;
      if (incomingUrl) {
        resetShareIntent();
        router.push(`/share/reel?url=${encodeURIComponent(incomingUrl)}` as never);
      }
    }
  }, [hasShareIntent, shareIntent, resetShareIntent, router]);

  const handleIdentify = (urlToIdentify?: string) => {
    const targetUrl = typeof urlToIdentify === 'string' ? urlToIdentify : url;
    if (!targetUrl.trim()) return;
    Keyboard.dismiss();
    
    identifyReel(targetUrl.trim(), {
      onSuccess: (data) => {
        setResult(data);
        setModalVisible(true);
      },
      onError: (error: Error) => {
        setResult({
          success: false,
          message: error.message || 'An unexpected error occurred while identifying the song.',
        });
        setModalVisible(true);
      },
    });
  };

  const handleAddPlaylist = (songId: string, title: string, artist: string) => {
    saveSong(songId, {
      onSuccess: (data) => {
        if (data.alreadySaved) {
          setDuplicateTitle(title);
          setDuplicateSongId(songId);
          setShowDuplicateModal(true);
        } else {
          Alert.alert('Success', `Saved "${title}" by ${artist} to your library!`);
        }
      },
      onError: (err) => {
        Alert.alert('Error', `Failed to save song: ${err.message}`);
      }
    });
  };

  const destinationName = destPref?.playlistName || activePlaylistName || 'Reels Finds';
  const provider = destPref?.provider || activeProvider || 'reeltune';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing['2xl'] }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Save a Song</Text>
          <Text style={styles.subtitle}>Identify songs from Instagram Reels instantly.</Text>
        </View>

        {/* One-Tap Banner */}
        <TouchableOpacity 
          style={styles.oneTapBanner}
          onPress={() => router.push('/share/reel' as never)}
          accessibilityRole="button"
          accessibilityLabel="One-Tap Reel Save"
        >
          <View style={styles.oneTapBannerLeft}>
            <Sparkles size={20} color={Colors.accent} />
            <View>
              <Text style={styles.oneTapBannerTitle}>One-Tap Reel Save</Text>
              <Text style={styles.oneTapBannerSubtitle}>Auto-identifies & saves directly to {destinationName}</Text>
            </View>
          </View>
          <SlidersHorizontal size={18} color={Colors.accent} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Paste Instagram Reel URL here..."
              placeholderTextColor={Colors.textSecondary}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, (!url.trim() || isPending) && styles.buttonDisabled]} 
            onPress={() => handleIdentify()}
            disabled={!url.trim() || isPending}
            accessibilityRole="button"
            accessibilityLabel="Identify Song"
          >
            {isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Identify Song</Text>
            )}
          </TouchableOpacity>

          {/* Destination Info */}
          <TouchableOpacity
            style={styles.destInfoRow}
            onPress={() => router.push('/settings/destinations' as never)}
            accessibilityRole="button"
            accessibilityLabel={`Default Destination: ${destinationName}`}
          >
            <FolderPlus size={16} color={Colors.textSecondary} />
            <Text style={styles.destInfoText}>
              Default Destination: <Text style={styles.destInfoBold}>{destinationName}</Text> ({provider})
            </Text>
          </TouchableOpacity>
        </View>

        <IdentificationResultModal
          visible={modalVisible}
          result={result}
          onClose={() => setModalVisible(false)}
          onAddPlaylist={handleAddPlaylist}
        />

        <DuplicateSaveModal
          visible={showDuplicateModal}
          title={duplicateTitle}
          onClose={() => setShowDuplicateModal(false)}
          onAddToPlaylist={() => setShowAddToPlaylist(true)}
        />

        {duplicateSongId ? (
          <AddToPlaylistModal
            visible={showAddToPlaylist}
            songId={duplicateSongId}
            onClose={() => setShowAddToPlaylist(false)}
            onSuccess={(playlistName) => {
              Alert.alert('Success', `Added to ${playlistName}`);
            }}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  oneTapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(217, 154, 91, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 154, 91, 0.3)',
    borderRadius: Radius.card,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
  },
  oneTapBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  oneTapBannerTitle: {
    ...Typography.h3,
    color: Colors.accent,
    marginBottom: 2,
  },
  oneTapBannerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  inputContainer: {
    gap: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.btn,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.h3,
    color: '#fff',
  },
  destInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  destInfoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  destInfoBold: {
    color: Colors.accent,
    fontFamily: 'Manrope_600SemiBold',
  },
});
