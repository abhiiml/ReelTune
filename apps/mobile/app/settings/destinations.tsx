import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import {
  useDestinationOptions,
  useDestinationPreferences,
  useUpdateDestinationPreferences,
} from '../../hooks/useDestinations';
import { useDestinationStore } from '../../store/useDestinationStore';
import {
  FolderPlus,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink,
  ArrowLeft,
  Circle,
} from 'lucide-react-native';

export default function DestinationsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: options, isLoading: optionsLoading } = useDestinationOptions();
  const { data: preferences, isLoading: prefsLoading } = useDestinationPreferences();
  const { mutate: updatePreferences, isPending: isUpdating } = useUpdateDestinationPreferences();
  const { setDestination } = useDestinationStore();

  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  const activeProvider = preferences?.provider || 'reeltune';
  const activePlaylistId = preferences?.playlistId;

  const handleSelectDefaultProvider = (providerName: string) => {
    const option = options?.find((o) => o.provider === providerName);
    if (!option) return;

    if (!option.isConnected && providerName !== 'reeltune') {
      Alert.alert(
        `${option.displayName} Not Connected`,
        `Please connect your ${option.displayName} account before setting it as default.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: () => {
              if (providerName === 'spotify') router.push('/settings/spotify' as never);
              if (providerName === 'apple-music') router.push('/settings/apple-music' as never);
              if (providerName === 'youtube') router.push('/settings/youtube' as never);
            },
          },
        ],
      );
      return;
    }

    const defaultPl = option.playlists?.[0];
    updatePreferences(
      {
        provider: providerName,
        playlistId: defaultPl?.id || null,
        playlistName: defaultPl?.name || 'Reels Finds',
      },
      {
        onSuccess: () => {
          setDestination(providerName, defaultPl?.id || null, defaultPl?.name || 'Reels Finds');
        },
      },
    );
  };

  const handleSelectPlaylist = (providerName: string, playlistId: string, playlistName: string) => {
    updatePreferences(
      {
        provider: providerName,
        playlistId,
        playlistName,
      },
      {
        onSuccess: () => {
          setDestination(providerName, playlistId, playlistName);
          setExpandedProvider(null);
        },
      },
    );
  };

  const isLoading = optionsLoading || prefsLoading;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Music Destinations</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <SlidersHorizontal size={28} color={Colors.accent} style={{ marginBottom: Spacing.sm }} />
          <Text style={styles.heroTitle}>Auto-Save Destination</Text>
          <Text style={styles.heroSubtitle}>
            Choose where songs shared from Instagram Reels will be automatically added.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: Spacing['2xl'] }} />
        ) : (
          <View style={styles.providersList}>
            {options?.map((option) => {
              const isDefault = activeProvider === option.provider;
              const isExpanded = expandedProvider === option.provider;

              return (
                <View key={option.provider} style={[styles.providerCard, isDefault && styles.providerCardActive]}>
                  <TouchableOpacity
                    style={styles.providerHeader}
                    onPress={() => handleSelectDefaultProvider(option.provider)}
                  >
                    <View style={styles.providerInfo}>
                      <View style={styles.radioContainer}>
                        {isDefault ? (
                          <CheckCircle2 size={22} color={Colors.accent} />
                        ) : (
                          <Circle size={22} color={Colors.textMuted} />
                        )}
                      </View>
                      <View>
                        <Text style={styles.providerName}>{option.displayName}</Text>
                        <Text
                          style={[
                            styles.providerStatus,
                            option.isConnected && styles.providerConnected,
                          ]}
                        >
                          {option.isConnected
                            ? 'Connected'
                            : option.provider === 'jiosaavn'
                            ? 'Unavailable'
                            : 'Not connected'}
                        </Text>
                      </View>
                    </View>

                    {option.isConnected ? (
                      <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() =>
                          setExpandedProvider(isExpanded ? null : option.provider)
                        }
                      >
                        <Text style={styles.playlistCountText}>
                          {option.playlists.length} playlists
                        </Text>
                        <ChevronRight
                          size={18}
                          color={Colors.textSecondary}
                          style={isExpanded ? { transform: [{ rotate: '90deg' }] } : undefined}
                        />
                      </TouchableOpacity>
                    ) : (
                      option.provider !== 'jiosaavn' && (
                        <TouchableOpacity
                          style={styles.connectButton}
                          onPress={() => {
                            if (option.provider === 'spotify') router.push('/settings/spotify' as never);
                            if (option.provider === 'apple-music') router.push('/settings/apple-music' as never);
                            if (option.provider === 'youtube') router.push('/settings/youtube' as never);
                          }}
                        >
                          <Text style={styles.connectButtonText}>Connect</Text>
                          <ExternalLink size={14} color={Colors.accent} />
                        </TouchableOpacity>
                      )
                    )}
                  </TouchableOpacity>

                  {/* Playlist Selector dropdown */}
                  {isExpanded && option.isConnected && (
                    <View style={styles.playlistsContainer}>
                      <Text style={styles.selectPlaylistTitle}>Select Default Playlist:</Text>
                      {option.playlists.length === 0 ? (
                        <Text style={styles.noPlaylistsText}>No playlists found on this service.</Text>
                      ) : (
                        option.playlists.map((pl) => {
                          const isSelected = activePlaylistId === pl.id && isDefault;
                          return (
                            <TouchableOpacity
                              key={pl.id}
                              style={[
                                styles.playlistRow,
                                isSelected && styles.playlistRowSelected,
                              ]}
                              onPress={() =>
                                handleSelectPlaylist(option.provider, pl.id, pl.name)
                              }
                            >
                              <View style={styles.playlistRowLeft}>
                                <FolderPlus
                                  size={16}
                                  color={isSelected ? Colors.accent : Colors.textSecondary}
                                />
                                <Text
                                  style={[
                                    styles.playlistRowName,
                                    isSelected && styles.playlistRowNameSelected,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {pl.name}
                                </Text>
                              </View>
                              {isSelected && <CheckCircle2 size={16} color={Colors.accent} />}
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {isUpdating && (
          <View style={styles.updatingOverlay}>
            <ActivityIndicator size="small" color={Colors.accent} />
            <Text style={styles.updatingText}>Saving preference...</Text>
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  providersList: {
    gap: Spacing.md,
  },
  providerCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  providerCardActive: {
    borderColor: 'rgba(217, 154, 91, 0.4)',
    backgroundColor: '#161310',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  radioContainer: {
    justifyContent: 'center',
  },
  providerName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  providerStatus: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  providerConnected: {
    color: Colors.success,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.btn,
  },
  playlistCountText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(217, 154, 91, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.btn,
  },
  connectButtonText: {
    ...Typography.small,
    color: Colors.accent,
    fontFamily: 'Manrope_600SemiBold',
  },
  playlistsContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardElevated,
    gap: Spacing.sm,
  },
  selectPlaylistTitle: {
    ...Typography.small,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  noPlaylistsText: {
    ...Typography.small,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.input,
  },
  playlistRowSelected: {
    backgroundColor: 'rgba(217, 154, 91, 0.15)',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  playlistRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  playlistRowName: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  playlistRowNameSelected: {
    color: Colors.accentLight,
    fontFamily: 'Manrope_600SemiBold',
  },
  updatingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  updatingText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
});
