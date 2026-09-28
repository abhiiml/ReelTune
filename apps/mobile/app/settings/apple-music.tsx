import { View, Text, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/Colors';
import { Typography, Radius, Spacing } from '../../constants/Theme';
import { useState, useEffect } from 'react';
import { Music } from 'lucide-react-native';
import { API_URL } from '../../lib/api';

export default function AppleMusicSettings() {
  const { session } = useAuthStore();
  
  
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  const fetchIntegrations = async () => {
    try {
      if (!session) return;
      const res = await fetch(`${API_URL}/integrations`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.some((i: { provider: string }) => i.provider === 'apple-music'));
      }
    } catch (err) {
      console.log('Failed to fetch integrations', err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter a Music User Token');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/integrations/apple-music/connect`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ musicUserToken: token.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to connect');
      }

      setToken('');
      fetchIntegrations();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/integrations/apple-music`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      fetchIntegrations();
    } catch {
      Alert.alert('Error', 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.appleMusic} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Music size={64} color={Colors.appleMusic} />
        <Text style={styles.title}>Apple Music</Text>
        <Text style={styles.subtitle}>
          {isConnected 
            ? 'Your Apple Music account is connected.'
            : 'Enter your Music User Token to connect Apple Music and sync playlists.'}
        </Text>
      </View>

      {!isConnected ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Music User Token"
            placeholderTextColor={Colors.textSecondary}
            value={token}
            onChangeText={setToken}
            multiline
          />
          <Pressable 
            style={[styles.button, { backgroundColor: Colors.appleMusic }]} 
            onPress={handleConnect}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Connect Apple Music</Text>}
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          <Pressable 
            style={[styles.button, { backgroundColor: Colors.cardElevated }]} 
            onPress={handleDisconnect}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.buttonText, { color: Colors.error }]}>Disconnect</Text>}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: Colors.cardElevated,
    color: Colors.textPrimary,
    padding: Spacing.md,
    borderRadius: Radius.btn,
    marginBottom: Spacing.lg,
    ...Typography.body,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    padding: Spacing.md,
    borderRadius: Radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    ...Typography.body,
    fontFamily: 'Manrope_700Bold',
    color: Colors.bgPrimary,
  }
});
