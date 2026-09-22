import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Radius } from '../../constants/Theme';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User as UserIcon } from 'lucide-react-native';

export default function ProfileScreen() {
  const { session, signOut } = useAuthStore();
  const [profile, setProfile] = useState<{ displayName?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <View style={styles.container}>
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
          
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
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
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(215, 122, 112, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.btn,
    gap: 8,
  },
  logoutText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    color: Colors.error,
  }
});
