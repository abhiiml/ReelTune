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
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { signUp, isLoading, error, clearError } = useAuthStore();

  const validate = () => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    }

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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    clearError();

    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
      // Supabase signs them in automatically after registration
      // onAuthStateChange in the store + _layout.tsx guard will redirect to /(tabs)
    } catch {
      // Error stored in useAuthStore
    }
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.subheading}>
            Join ReelTune and save the songs from your reels.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Global error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={(t) => { setName(t); clearError(); }}
            textContentType="name"
            autoComplete="name"
            error={nameError}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); clearError(); }}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            error={emailError}
            containerStyle={styles.inputGap}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); clearError(); }}
            isPassword
            textContentType="newPassword"
            autoComplete="new-password"
            error={passwordError}
            containerStyle={styles.inputGap}
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); clearError(); }}
            isPassword
            textContentType="newPassword"
            error={confirmPasswordError}
            containerStyle={styles.inputGap}
          />

          <Button
            label="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.createBtn}
          />

          <Text style={styles.terms}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.footerText, styles.footerLink]}> Sign In</Text>
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
    paddingTop: 72,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 32,
  },
  heading: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subheading: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    gap: 0,
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
  createBtn: {
    marginTop: 28,
  },
  terms: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.accent,
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
