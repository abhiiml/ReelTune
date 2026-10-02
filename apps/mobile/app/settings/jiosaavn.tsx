import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography, Radius, Spacing } from '../../constants/Theme';
import { Music, ArrowLeft } from 'lucide-react-native';

export default function JioSaavnSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>JioSaavn</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.header}>
        <Music size={56} color={Colors.jiosaavn} />
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
    paddingHorizontal: Spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  topBarTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
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
