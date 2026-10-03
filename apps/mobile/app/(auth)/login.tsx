import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Music2 } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { GoogleIcon } from '../../components/ui/GoogleIcon';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signIn, signInWithGoogle, isLoading, error, clearError } = useAuthStore();

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }

    return valid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    clearError();

    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch {
      // Error is stored in useAuthStore and displayed in errorBanner
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      // Handled in store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Music2 size={28} color={Colors.accent} strokeWidth={1.8} />
          </View>
          <Text style={styles.wordmark}>ReelTune</Text>
          <Text style={styles.tagline}>Your soundtrack, everywhere.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.heading}>Welcome back</Text>

          {/* Global error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); clearError(); }}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoComplete="email"
            error={emailError}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); clearError(); }}
            isPassword
            textContentType="password"
            autoComplete="current-password"
            error={passwordError}
            containerStyle={styles.inputGap}
          />

          {/* Forgot password */}
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotLink}
            hitSlop={8}
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>

          {/* Sign in button */}
          <Button
            label="Sign In"
            onPress={handleSignIn}
            isLoading={isLoading}
            style={styles.primaryBtn}
            fullWidth
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google sign-in */}
          <Button
            label="Continue with Google"
            variant="outline"
            onPress={handleGoogleSignIn}
            isLoading={isLoading}
            leftIcon={<GoogleIcon size={18} />}
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={15}>
            <Text style={[styles.footerText, styles.footerLink]}> Register</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 48,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 24,
    gap: 8,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.card,
  },
  wordmark: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  form: {
    gap: 0,
  },
  heading: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: '#3D1A18',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorBannerText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: Colors.error,
    lineHeight: 18,
  },
  inputGap: {
    marginTop: 14,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  linkText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: Colors.accent,
  },
  primaryBtn: {
    marginBottom: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.cardElevated,
  },
  dividerText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    color: Colors.accent,
    fontFamily: 'Manrope_600SemiBold',
  },
});

