import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps extends PressableProps {
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

  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
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
    </Pressable>
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
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Label variants
  label: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
  },
  primaryLabel: {
    color: Colors.bgPrimary,
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
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
