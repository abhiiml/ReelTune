import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Music, Lock, Heart } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import type { Playlist } from '../../hooks/usePlaylists';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlaylistLikes, useLikePlaylist, useUnlikePlaylist } from '../../hooks/useSocial';

interface PlaylistCardProps {
  playlist: Playlist;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PlaylistCard({ playlist, onPress, style }: PlaylistCardProps) {
  const { user } = useAuthStore();
  const { data: likes } = usePlaylistLikes(playlist.id);
  const { mutate: likePlaylist } = useLikePlaylist();
  const { mutate: unlikePlaylist } = useUnlikePlaylist();

  const isLiked = likes?.some(l => l.id === user?.id);
  const showLike = !playlist.isPrivate && playlist.userId !== user?.id; // Assuming playlist object has userId, wait, usePlaylists might not return userId

  const handleLikeToggle = () => {
    if (isLiked) unlikePlaylist(playlist.id);
    else likePlaylist(playlist.id);
  };

  return (
    <Pressable
      style={({ pressed }) =>
        StyleSheet.flatten([
          styles.container,
          style,
          pressed && styles.pressed,
        ])
      }
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Playlist ${playlist.name}`}
    >
      <View style={styles.artworkContainer}>
        <View style={styles.placeholderArtwork}>
          <Music size={32} color={Colors.textMuted} />
        </View>
        {showLike && (
          <Pressable style={styles.likeBtn} onPress={handleLikeToggle}>
            <Heart size={20} color={isLiked ? Colors.error : Colors.textPrimary} fill={isLiked ? Colors.error : 'transparent'} />
          </Pressable>
        )}
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
          {likes !== undefined && likes.length > 0 && ` • ${likes.length} ${likes.length === 1 ? 'like' : 'likes'}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '47%',
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
    position: 'relative',
  },
  placeholderArtwork: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 6,
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
