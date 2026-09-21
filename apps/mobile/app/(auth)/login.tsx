import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Music2 } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signIn, isLoading, error, clearError } = useAuthStore();

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
      // onAuthStateChange in the store will update session
      // _layout.tsx redirect guard will send user to /(tabs)
    } catch (e: any) {
      // Error is already stored in useAuthStore; show inline
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      'Coming Soon',
      'Google Sign-In will be available in an upcoming update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
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
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>

          {/* Sign in button */}
          <Button
            label="Sign In"
            onPress={handleSignIn}
            isLoading={isLoading}
            style={styles.primaryBtn}
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
            leftIcon={
              <Text style={styles.googleIcon}>G</Text>
            }
          />
        </View>

        {/* Register link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
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
    paddingBottom: 48,
    justifyContent: 'center',
    gap: 0,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 48,
    gap: 10,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.card,
  },
  wordmark: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  form: {
    gap: 0,
  },
  heading: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 24,
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
  },
  inputGap: {
    marginTop: 14,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 24,
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
    marginVertical: 20,
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
  googleIcon: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
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
