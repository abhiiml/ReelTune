import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  style,
  labelStyle,
  fullWidth = true,
  onPress,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const handlePress = (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      accessibilityLabel={rest.accessibilityLabel || label}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.bgPrimary : Colors.accent}
        />
      ) : (
        <>
          {leftIcon && leftIcon}
          <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles], labelStyle]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },

  // Variants
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.cardElevated,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.cardElevated,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Label variants
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  primaryLabel: {
    color: '#080706',
  },
  secondaryLabel: {
    color: Colors.textPrimary,
  },
  outlineLabel: {
    color: Colors.textPrimary,
  },
  ghostLabel: {
    color: Colors.accent,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
});
