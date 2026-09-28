import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { WaveformAnimation } from '../../components/ui/WaveformAnimation';
import { useShareReel } from '../../hooks/useShareReel';
import type { ShareReelResponse } from '../../hooks/useShareReel';
import { useDestinationPreferences, useDestinationOptions } from '../../hooks/useDestinations';
import { useDestinationStore } from '../../store/useDestinationStore';
import { extractAndNormalizeInstagramUrl } from '../../lib/instagram';
import {
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  Music2,
  RefreshCw,
  FolderPlus,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';

export default function ShareReelScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string }>();
  const [inputUrl, setInputUrl] = useState(params.url || '');
  const [hasStarted, setHasStarted] = useState(false);
  const [result, setResult] = useState<ShareReelResponse | null>(null);

  const { mutate: shareReel, isPending } = useShareReel();
  const { data: destinationPref } = useDestinationPreferences();
  const { data: destinationOptions } = useDestinationOptions();
  const { activeProvider, activePlaylistId, activePlaylistName, setDestination } =
    useDestinationStore();

  const handleProcessReel = useCallback(
    (targetUrl: string) => {
      const { isValid, cleanUrl } = extractAndNormalizeInstagramUrl(targetUrl);
      if (!isValid || !cleanUrl) {
        setResult({
          success: false,
          status: 'INVALID_URL',
          message: "That doesn't look like an Instagram Reel. Please paste a valid Reel link.",
          actions: ['TRY_AGAIN', 'PASTE_URL'],
        });
        return;
      }

      setHasStarted(true);
      setResult(null);
      Keyboard.dismiss();

      shareReel(
        {
          url: cleanUrl,
          provider: destinationPref?.provider || activeProvider,
          playlistId: destinationPref?.playlistId || activePlaylistId || undefined,
        },
        {
          onSuccess: (data) => {
            setResult(data);
            if (data.destination) {
              setDestination(
                data.destination.provider,
                data.destination.playlistId,
                data.destination.playlistName,
              );
            }
          },
          onError: (err) => {
            setResult({
              success: false,
              status: 'RECOGNITION_FAILED',
              message: err.message || "We couldn't identify the song from this Reel.",
              actions: ['SEARCH_MANUALLY', 'TRY_AGAIN'],
            });
          },
        },
      );
    },
    [shareReel, destinationPref, activeProvider, activePlaylistId, setDestination],
  );

  useEffect(() => {
    if (params.url && !hasStarted) {
      setInputUrl(params.url);
      handleProcessReel(params.url);
    }
  }, [params.url, hasStarted, handleProcessReel]);

  const providerName =
    result?.destination?.providerDisplayName ||
    destinationOptions?.find((o) => o.provider === (destinationPref?.provider || activeProvider))
      ?.displayName ||
    'ReelTune';

  const targetPlaylistTitle =
    result?.destination?.playlistName ||
    destinationPref?.playlistName ||
    activePlaylistName ||
    'Reels Finds';

  const isSuccess = result?.status === 'ADDED' || result?.status === 'ALREADY_EXISTS';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>One-Tap Reel Save</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
        >
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Processing State */}
        {isPending && (
          <View style={styles.centeredCard}>
            <View style={styles.waveformContainer}>
              <WaveformAnimation barCount={9} height={56} color={Colors.accent} />
            </View>
            <Text style={styles.statusHeading}>Finding your song...</Text>
            <Text style={styles.statusSubtext}>
              Auto-matching track and saving to {targetPlaylistTitle} ({providerName})
            </Text>
            <ActivityIndicator color={Colors.accent} style={{ marginTop: Spacing.xl }} />
          </View>
        )}

        {/* Success State */}
        {!isPending && isSuccess && result?.song && (
          <View style={styles.resultCard}>
            <View style={styles.artworkContainer}>
              <Image
                source={{
                  uri:
                    result.song.artwork ||
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
                }}
                style={styles.artwork}
              />
              <View style={styles.badgeSuccess}>
                <CheckCircle2 size={18} color="#080706" />
                <Text style={styles.badgeSuccessText}>
                  {result.status === 'ALREADY_EXISTS' ? 'Already in Playlist' : 'Song Found'}
                </Text>
              </View>
            </View>

            <Text style={styles.songTitle} numberOfLines={2}>
              {result.song.title}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {result.song.artists?.join(', ')}
            </Text>

            {/* Destination Pill */}
            <View style={styles.destinationPill}>
              <FolderPlus size={18} color={Colors.accent} />
              <Text style={styles.destinationPillText}>
                {result.status === 'ALREADY_EXISTS' ? 'Already in ' : 'Added to '}
                <Text style={styles.boldText}>{targetPlaylistTitle}</Text> on {providerName}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionButtonsContainer}>
              {result.destination?.playlistId && result.destination.provider === 'reeltune' && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    router.push(`/playlist/${result.destination?.playlistId}` as never)
                  }
                >
                  <Text style={styles.primaryButtonText}>Open Playlist</Text>
                  <ArrowRight size={18} color="#080706" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  result.destination?.provider !== 'reeltune' && styles.primaryButton,
                ]}
                onPress={() => router.replace('/(tabs)')}
              >
                <Text
                  style={
                    result.destination?.provider !== 'reeltune'
                      ? styles.primaryButtonText
                      : styles.secondaryButtonText
                  }
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Failure / Fallback State */}
        {!isPending && result && !isSuccess && (
          <View style={styles.resultCard}>
            <View style={styles.errorIconContainer}>
              <AlertCircle size={48} color={Colors.error} />
            </View>

            <Text style={styles.errorTitle}>
              {result.status === 'PROVIDER_NOT_CONNECTED'
                ? 'Provider Not Connected'
                : 'Identification Unavailable'}
            </Text>
            <Text style={styles.errorSubtitle}>{result.message}</Text>

            <View style={styles.actionButtonsContainer}>
              {result.status === 'PROVIDER_NOT_CONNECTED' ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push('/settings/destinations' as never)}
                >
                  <SlidersHorizontal size={18} color="#080706" />
                  <Text style={styles.primaryButtonText}>Manage Destinations</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push('/search' as never)}
                >
                  <Search size={18} color="#080706" />
                  <Text style={styles.primaryButtonText}>Search Song Manually</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleProcessReel(inputUrl)}
              >
                <RefreshCw size={18} color={Colors.textPrimary} />
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Initial Empty Input State if opened manually */}
        {!isPending && !result && (
          <View style={styles.manualContainer}>
            <View style={styles.manualHeader}>
              <View style={styles.iconCircle}>
                <Music2 size={32} color={Colors.accent} />
              </View>
              <Text style={styles.manualTitle}>Auto Save Reel Song</Text>
              <Text style={styles.manualSubtitle}>
                Share directly from Instagram, or paste the link below to automatically identify and
                add to your playlist.
              </Text>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="https://www.instagram.com/reel/..."
                placeholderTextColor={Colors.textSecondary}
                value={inputUrl}
                onChangeText={setInputUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Destination Preference Summary */}
            <TouchableOpacity
              style={styles.destinationBar}
              onPress={() => router.push('/settings/destinations' as never)}
            >
              <View style={styles.destinationBarLeft}>
                <FolderPlus size={18} color={Colors.accent} />
                <Text style={styles.destinationBarText}>
                  Destination: <Text style={styles.boldText}>{targetPlaylistTitle}</Text> (
                  {providerName})
                </Text>
              </View>
              <SlidersHorizontal size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, !inputUrl.trim() && styles.buttonDisabled]}
              disabled={!inputUrl.trim()}
              onPress={() => handleProcessReel(inputUrl)}
            >
              <Text style={styles.primaryButtonText}>Identify & Add to Playlist</Text>
              <ArrowRight size={18} color="#080706" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardElevated,
  },
  topBarTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  centeredCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.card,
    padding: Spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  waveformContainer: {
    marginBottom: Spacing.xl,
  },
  statusHeading: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  statusSubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  resultCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 154, 91, 0.2)',
  },
  artworkContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  artwork: {
    width: 180,
    height: 180,
    borderRadius: Radius.artwork,
    backgroundColor: Colors.cardElevated,
  },
  badgeSuccess: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.btn,
  },
  badgeSuccessText: {
    ...Typography.small,
    fontFamily: 'Manrope_700Bold',
    color: '#080706',
  },
  songTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  songArtist: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  destinationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.btn,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  destinationPillText: {
    ...Typography.small,
    color: Colors.textPrimary,
  },
  boldText: {
    fontFamily: 'Manrope_700Bold',
    color: Colors.accent,
  },
  actionButtonsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: Radius.btn,
    paddingVertical: Spacing.md,
    height: 52,
  },
  primaryButtonText: {
    ...Typography.h3,
    color: '#080706',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.btn,
    paddingVertical: Spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  secondaryButtonText: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.textPrimary,
  },
  errorIconContainer: {
    marginBottom: Spacing.md,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  errorSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  manualContainer: {
    gap: Spacing.lg,
  },
  manualHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(217, 154, 91, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  manualTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  manualSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  inputWrapper: {
    backgroundColor: Colors.card,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.base,
  },
  destinationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.btn,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  destinationBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  destinationBarText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
