import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { Search, PlusCircle, PlayCircle, Music, Clock } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useSavedSongs } from '../../hooks/useSavedSongs';
import { usePlaylists } from '../../hooks/usePlaylists';
import { PlaylistCard } from '../../components/ui/PlaylistCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthStore();
  
  const [profile, setProfile] = useState<{ displayName?: string } | null>(null);
  
  const { data: songsData, isLoading: songsLoading } = useSavedSongs();
  const { data: playlists, isLoading: playlistsLoading } = usePlaylists();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.access_token) return;
      try {
        const apiBase = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
        const res = await fetch(`${apiBase}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, [session]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const nameToDisplay = profile?.displayName?.split(' ')[0] || 'there';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}, {nameToDisplay}</Text>
          <Text style={styles.subGreeting}>What did you discover?</Text>
        </View>

        {/* Search Bar (Navigates) */}
        <Pressable style={styles.searchBar} onPress={() => router.push('/search')}>
          <Search size={20} color={Colors.textSecondary} />
          <Text style={styles.searchText}>Search for a song or artist...</Text>
        </Pressable>

        {/* Hero Card */}
        <Pressable style={styles.heroCard} onPress={() => router.push('/save')}>
          <View style={styles.heroContent}>
            <View style={styles.heroIconBadge}>
              <PlusCircle size={28} color={Colors.accent} />
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Save from Reel</Text>
              <Text style={styles.heroSubtitle}>Paste a URL to identify and save music.</Text>
            </View>
          </View>
        </Pressable>

        {/* Stats Mini Card */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Music size={20} color={Colors.accent} style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>{songsData?.totalCount ?? 0}</Text>
            <Text style={styles.statLabel}>Songs Saved</Text>
          </View>
          <View style={styles.statBox}>
            <PlayCircle size={20} color={Colors.accent} style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>{playlists?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Playlists</Text>
          </View>
        </View>

        {/* Recently Saved */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Saved</Text>
            <Pressable onPress={() => router.push('/library')}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          {songsLoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.loader} />
          ) : songsData?.value?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {songsData.value.slice(0, 10).map((savedSong) => (
                <Pressable 
                  key={savedSong.id} 
                  style={styles.recentSongCard}
                  onPress={() => router.push(`/song/${savedSong.song.id}` as never)}
                >
                  <Image 
                    source={{ uri: savedSong.song.artwork ?? 'https://placehold.co/150/1c1c1e/FFFFFF/png?text=Music' }} 
                    style={styles.recentSongImage} 
                  />
                  <Text style={styles.recentSongTitle} numberOfLines={1}>{savedSong.song.title}</Text>
                  <Text style={styles.recentSongArtist} numberOfLines={1}>{savedSong.song.artists[0]}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyBox}>
              <Clock size={24} color={Colors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyBoxText}>No songs saved yet.</Text>
            </View>
          )}
        </View>

        {/* Your Playlists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Playlists</Text>
          </View>

          {playlistsLoading ? (
            <ActivityIndicator color={Colors.accent} style={styles.loader} />
          ) : playlists?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {playlists.slice(0, 5).map((playlist) => (
                <View key={playlist.id} style={styles.horizontalPlaylistCard}>
                  <PlaylistCard playlist={playlist} onPress={() => router.push(`/playlist/${playlist.id}` as never)} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyBox}>
              <Music size={24} color={Colors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyBoxText}>No playlists created yet.</Text>
            </View>
          )}
        </View>

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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subGreeting: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.input,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  heroCard: {
    backgroundColor: 'rgba(215, 122, 112, 0.1)',
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(215, 122, 112, 0.2)',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(215, 122, 112, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.accent,
    marginBottom: 4,
  },
  heroSubtitle: {
    ...Typography.small,
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.card,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  seeAllText: {
    ...Typography.body,
    color: Colors.accent,
    fontFamily: 'Manrope_600SemiBold',
  },
  loader: {
    marginTop: Spacing.md,
  },
  horizontalList: {
    gap: Spacing.md,
  },
  recentSongCard: {
    width: 140,
    marginRight: Spacing.sm,
  },
  recentSongImage: {
    width: 140,
    height: 140,
    borderRadius: Radius.card,
    backgroundColor: Colors.cardElevated,
    marginBottom: Spacing.sm,
  },
  recentSongTitle: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  recentSongArtist: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  horizontalPlaylistCard: {
    width: 160,
    marginRight: Spacing.sm,
  },
  emptyBox: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.card,
  },
  emptyBoxText: {
    ...Typography.body,
    color: Colors.textSecondary,
  }
});
