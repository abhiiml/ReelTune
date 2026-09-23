import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Radius, Spacing } from '../../constants/Theme';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User as UserIcon, Settings, ChevronRight, Music, PlayCircle, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useSavedSongs } from '../../hooks/useSavedSongs';
import { usePlaylists } from '../../hooks/usePlaylists';
import { useIntegrations } from '../../hooks/useIntegrations';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';

export default function ProfileScreen() {
  const { session, signOut } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<{ displayName?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: songsData } = useSavedSongs();
  const { data: playlists } = usePlaylists();
  const { data: integrations } = useIntegrations();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.access_token) return;
      try {
        const apiBase = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
        const res = await fetch(`${apiBase}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will erase all your saved songs and playlists.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            deleteAccount(undefined, {
              onSuccess: () => {
                signOut();
              },
              onError: (err) => {
                Alert.alert('Error', `Failed to delete account: ${err.message}`);
              }
            });
          }
        },
      ]
    );
  };

  const isSpotifyConnected = integrations?.some(i => i.provider === 'spotify');
  const isYoutubeConnected = integrations?.some(i => i.provider === 'youtube');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Profile</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.card}>
            <View style={styles.avatar}>
               <UserIcon size={40} color={Colors.textSecondary} />
            </View>
            <Text style={styles.name}>{profile?.displayName ?? 'User'}</Text>
            <Text style={styles.email}>{session?.user?.email ?? profile?.email ?? ''}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Music size={20} color={Colors.accent} style={{ marginBottom: 4 }} />
                <Text style={styles.statValue}>{songsData?.totalCount ?? 0}</Text>
                <Text style={styles.statLabel}>Songs Saved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <PlayCircle size={20} color={Colors.accent} style={{ marginBottom: 4 }} />
                <Text style={styles.statValue}>{playlists?.length ?? 0}</Text>
                <Text style={styles.statLabel}>Playlists</Text>
              </View>
            </View>
          </View>
        )}

        {!loading && (
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Connections</Text>
            
            <TouchableOpacity 
              style={styles.settingRow} 
              onPress={() => router.push('/settings/spotify' as never)}
            >
              <View style={styles.settingRowLeft}>
                <Settings size={20} color={Colors.textSecondary} />
                <Text style={styles.settingText}>Spotify</Text>
              </View>
              <View style={styles.settingRowRight}>
                <Text style={[styles.statusText, isSpotifyConnected && styles.statusConnected]}>
                  {isSpotifyConnected ? 'Connected' : 'Disconnected'}
                </Text>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingRow} 
              onPress={() => router.push('/settings/youtube' as never)}
            >
              <View style={styles.settingRowLeft}>
                <Settings size={20} color={Colors.textSecondary} />
                <Text style={styles.settingText}>YouTube</Text>
              </View>
              <View style={styles.settingRowRight}>
                <Text style={[styles.statusText, isYoutubeConnected && styles.statusConnected]}>
                  {isYoutubeConnected ? 'Connected' : 'Disconnected'}
                </Text>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Account</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
              <LogOut size={20} color={Colors.textPrimary} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? (
                <ActivityIndicator color={Colors.error} size="small" />
              ) : (
                <>
                  <Trash2 size={20} color={Colors.error} />
                  <Text style={styles.deleteText}>Delete Account</Text>
                </>
              )}
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
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 30,
  },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.card,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgPrimary,
    padding: Spacing.md,
    borderRadius: Radius.btn,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.cardElevated,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  settingsSection: {
    marginTop: 32,
    paddingBottom: Spacing['3xl'],
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSecondary,
    padding: 16,
    borderRadius: Radius.btn,
    marginBottom: 12,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  statusText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  statusConnected: {
    color: Colors.success,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Radius.btn,
    marginBottom: 12,
    gap: 12,
  },
  logoutText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(215, 122, 112, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Radius.btn,
    gap: 12,
  },
  deleteText: {
    ...Typography.body,
    color: Colors.error,
  },
});

