import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, Radius } from '../constants/Theme';
import { Music2 } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Screen Not Found', headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Music2 size={36} color={Colors.accent} />
        </View>
        <Text style={styles.title}>Screen Not Found</Text>
        <Text style={styles.subtitle}>The screen you were looking for doesn't exist.</Text>

        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Return to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(217, 154, 91, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  link: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: Radius.btn,
  },
  linkText: {
    ...Typography.body,
    fontFamily: 'Manrope_700Bold',
    color: Colors.bgPrimary,
  },
});
