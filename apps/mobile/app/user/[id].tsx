import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
// @ts-ignore
import { useLocalSearchParams as useExpoParams, useRouter as useExpoRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { useUserProfile, useFollowUser, useUnfollowUser, useFollowers } from '../../hooks/useSocial';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowLeft, User as UserIcon } from 'lucide-react-native';
import { PlaylistCard } from '../../components/ui/PlaylistCard';

export default function UserProfileScreen() {
  const { id } = useExpoParams<{ id: string }>();
  const router = useExpoRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuthStore();

  const { data: profile, isLoading } = useUserProfile(id);
  const { data: followers } = useFollowers(id);
  const { mutate: followUser, isPending: isFollowing } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowing } = useUnfollowUser();

  const isMe = currentUser?.id === id;
  const amIFollowing = followers?.some(f => f.id === currentUser?.id);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: Colors.textSecondary }}>User not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: Spacing.md }}>
          <Text style={{ color: Colors.accent }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleFollowToggle = () => {
    if (amIFollowing) {
      unfollowUser(id);
    } else {
      followUser(id);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <FlatList
        data={profile.publicPlaylists}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
               <UserIcon size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.displayName}>{profile.displayName || 'Anonymous'}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{profile.followerCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{profile.followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {!isMe && (
              <Pressable 
                style={[styles.followBtn, amIFollowing && styles.followingBtn]} 
                onPress={handleFollowToggle}
                disabled={isFollowing || isUnfollowing}
              >
                <Text style={[styles.followBtnText, amIFollowing && styles.followingBtnText]}>
                  {amIFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            )}

            <Text style={styles.sectionTitle}>Public Playlists</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptySubtitle}>No public playlists yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PlaylistCard 
            playlist={{ ...item, userId: profile.id, _count: { songs: item.songCount } }} 
            onPress={() => router.push(`/playlist/${item.id}`)}
          />
        )}
      />
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
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: Colors.cardElevated,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  displayName: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: 999,
    marginBottom: Spacing.xl,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.textMuted,
  },
  followBtnText: {
    ...Typography.body,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
  },
  followingBtnText: {
    color: Colors.textPrimary,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
