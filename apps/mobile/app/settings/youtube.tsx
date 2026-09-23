import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Radius } from '../../constants/Theme';
import { useAuthStore } from '../../store/useAuthStore';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function YouTubeConnectionScreen() {
  const { session } = useAuthStore();
  const router = useRouter();
  const url = Linking.useURL();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectedService, setConnectedService] = useState<{ providerAccountId: string } | null>(null);

  const apiBase = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

  const fetchIntegrations = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/integrations`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const youtube = data.find((i: { provider: string }) => i.provider === 'youtube');
        setConnectedService(youtube || null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [session]);

  useEffect(() => {
    if (url) {
      const parsed = Linking.parse(url);
      if (parsed.path === 'settings/youtube' || parsed.path === 'settings/youtube/callback') {
        if (parsed.queryParams?.connected === 'true' || parsed.queryParams?.success === 'true') {
          Alert.alert('Success', 'YouTube connected successfully!');
          fetchIntegrations();
        } else if (parsed.queryParams?.error) {
          Alert.alert('Error', 'Failed to connect YouTube.');
        }
      }
    }
  }, [url]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const connectUrl = `${apiBase}/api/v1/integrations/youtube/connect`;
      const result = await WebBrowser.openAuthSessionAsync(
        connectUrl,
        Linking.createURL('settings/youtube')
      );
      
      if (result.type === 'success' && result.url) {
         const parsed = Linking.parse(result.url);
         if (parsed.queryParams?.connected === 'true') {
             fetchIntegrations();
         }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while connecting.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/integrations/youtube`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        setConnectedService(null);
        Alert.alert('Success', 'YouTube disconnected.');
      } else {
        Alert.alert('Error', 'Failed to disconnect YouTube.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while disconnecting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.heading}>YouTube</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />
      ) : connectedService ? (
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <CheckCircle2 color={Colors.success} size={24} />
            <Text style={styles.statusText}>Connected as {connectedService.providerAccountId}</Text>
          </View>
          <Text style={styles.description}>Your ReelTune playlists will be synced to this YouTube account.</Text>
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.description}>
            Connect your YouTube account to automatically sync your saved ReelTune playlists to YouTube Music.
          </Text>
          <TouchableOpacity 
            style={[styles.connectButton, connecting && styles.connectButtonDisabled]} 
            onPress={handleConnect}
            disabled={connecting}
          >
            {connecting ? (
              <ActivityIndicator color={Colors.bgPrimary} />
            ) : (
              <Text style={styles.connectText}>Connect YouTube</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    marginRight: 16,
    padding: 8,
    marginLeft: -8,
  },
  heading: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.card,
    padding: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statusText: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  connectButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 14,
    borderRadius: Radius.btn,
    alignItems: 'center',
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  connectText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  disconnectButton: {
    backgroundColor: 'rgba(215, 122, 112, 0.1)',
    paddingVertical: 14,
    borderRadius: Radius.btn,
    alignItems: 'center',
  },
  disconnectText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: Colors.error,
  },
});
