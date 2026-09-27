import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography, Radius, Spacing } from '../../constants/Theme';
import { Music } from 'lucide-react-native';

export default function JioSaavnSettings() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Music size={64} color={Colors.jiosaavn} />
        <Text style={styles.title}>JioSaavn</Text>
        <Text style={styles.subtitle}>
          JioSaavn Integration Unavailable
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.description}>
          JioSaavn currently does not provide an official public API for developers.
          {'\n\n'}
          To protect user data and comply with terms of service, ReelTune cannot use unofficial scraping methods or undocumented endpoints.
          {'\n\n'}
          This integration is architecturally ready but remains blocked until JioSaavn releases a supported public API.
        </Text>
        
        <Pressable 
          style={[styles.button, { backgroundColor: Colors.jiosaavn }]} 
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
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
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontFamily: 'Manrope_700Bold',
  },
  card: {
    backgroundColor: Colors.cardElevated,
    padding: Spacing.xl,
    borderRadius: Radius.card,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
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
