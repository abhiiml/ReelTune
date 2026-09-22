import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ViewStyle, StyleProp } from 'react-native';
import { Song } from '@reeltune/types';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { MoreVertical } from 'lucide-react-native';

interface SongRowProps {
  song: Song | Partial<Song>;
  onPress?: () => void;
  onMenuPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SongRow({ song, onPress, onMenuPress, style }: SongRowProps) {
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
        {song.artwork ? (
          <Image source={{ uri: song.artwork }} style={styles.artwork} />
        ) : (
          <View style={styles.placeholderArtwork} />
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title || 'Unknown Title'}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {Array.isArray(song.artists) ? song.artists.join(', ') : 'Unknown Artist'}
        </Text>
      </View>
      
      {onMenuPress && (
        <Pressable style={styles.menuButton} onPress={onMenuPress} hitSlop={16}>
          <MoreVertical size={20} color={Colors.textSecondary} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
  },
  artworkContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.artwork / 2,
    overflow: 'hidden',
    backgroundColor: Colors.cardElevated,
    marginRight: Spacing.md,
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
  details: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.textPrimary,
  },
  artist: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  menuButton: {
    padding: Spacing.sm,
  },
});
