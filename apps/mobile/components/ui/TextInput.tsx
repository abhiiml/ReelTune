import React, { useState, useRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface TextInputProps extends RNTextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export function TextInput({
  label,
  error,
  containerStyle,
  isPassword = false,
  value,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Floating label animation
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const animateLabel = (toValue: number) => {
    Animated.timing(labelAnim, {
      toValue,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = (e: Parameters<NonNullable<RNTextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    animateLabel(1);
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<RNTextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    if (!value) animateLabel(0);
    onBlur?.(e);
  };

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 6] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.textMuted, isFocused ? Colors.accent : Colors.textSecondary],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        {/* Floating Label */}
        <Animated.Text
          style={[
            styles.floatingLabel,
            { top: labelTop, fontSize: labelSize, color: labelColor },
          ]}
        >
          {label}
        </Animated.Text>

        <RNTextInput
          style={styles.input}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={Colors.accent}
          {...rest}
        />

        {/* Password toggle */}
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((p) => !p)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            {showPassword ? (
              <EyeOff size={18} color={Colors.textMuted} strokeWidth={1.8} />
            ) : (
              <Eye size={18} color={Colors.textMuted} strokeWidth={1.8} />
            )}
          </Pressable>
        )}
      </View>

      {/* Error message */}
      {!!error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  inputWrapper: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
    paddingTop: 22,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 58,
  },
  inputWrapperFocused: {
    borderColor: Colors.accent,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    fontFamily: 'Manrope_500Medium',
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
    marginBottom: 0,
  },
  eyeButton: {
    marginLeft: 8,
    paddingBottom: 2,
  },
  errorText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: Colors.error,
    marginLeft: 4,
  },
});
