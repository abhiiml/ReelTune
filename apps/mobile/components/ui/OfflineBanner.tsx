import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing } from '../../constants/Theme';

export function OfflineBanner() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WifiOff size={16} color={Colors.bgPrimary} />
      <Text style={styles.text}>No connection. Some features may be unavailable.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    zIndex: 999,
  },
  text: {
    ...Typography.small,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.bgPrimary,
  }
});
