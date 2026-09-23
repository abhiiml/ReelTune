import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Typography, Radius, Spacing } from '../../constants/Theme';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ToastType } from '../../store/useToastStore';

interface ToastProps {
  message: string;
  type: ToastType;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, type, onHide, duration = 3000 }: ToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      onHide();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onHide]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return Colors.error;
      case 'info': return Colors.accent;
      default: return Colors.success;
    }
  };

  const IconComponent = () => {
    switch (type) {
      case 'error': return <AlertCircle size={20} color={Colors.bgPrimary} />;
      case 'info': return <Info size={20} color={Colors.bgPrimary} />;
      default: return <CheckCircle2 size={20} color={Colors.bgPrimary} />;
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={[
        styles.container, 
        { top: insets.top + Spacing.md, backgroundColor: getBackgroundColor() }
      ]}
    >
      <IconComponent />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: Radius.card,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  text: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.bgPrimary,
    flex: 1,
  },
});

