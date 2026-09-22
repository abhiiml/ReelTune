import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Music, Lock } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import type { Playlist } from '../../hooks/usePlaylists';

interface PlaylistCardProps {
  playlist: Playlist;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PlaylistCard({ playlist, onPress, style }: PlaylistCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.artworkContainer}>
        <View style={styles.placeholderArtwork}>
          <Music size={32} color={Colors.textMuted} />
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {playlist.name}
          </Text>
          {playlist.isPrivate && (
            <Lock size={12} color={Colors.textMuted} style={styles.lockIcon} />
          )}
        </View>
        
        <Text style={styles.subtitle} numberOfLines={1}>
          {playlist._count?.songs || 0} {(playlist._count?.songs === 1) ? 'song' : 'songs'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '47%', // Roughly half width for 2-column grid
    marginBottom: Spacing.lg,
  },
  pressed: {
    opacity: 0.7,
  },
  artworkContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.card,
    overflow: 'hidden',
    backgroundColor: Colors.cardElevated,
    marginBottom: Spacing.sm,
  },
  placeholderArtwork: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    paddingHorizontal: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  lockIcon: {
    marginTop: 2,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
