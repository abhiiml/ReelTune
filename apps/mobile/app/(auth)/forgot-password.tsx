import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MailCheck } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);

  const { sendPasswordReset, isLoading, error, clearError } = useAuthStore();

  const validate = () => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    clearError();

    try {
      await sendPasswordReset(email.trim().toLowerCase());
      setSent(true);
    } catch {
      // Error displayed via banner
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MailCheck size={32} color={Colors.accent} strokeWidth={1.5} />
          </View>
          <Text style={styles.successHeading}>Check your inbox</Text>
          <Text style={styles.successBody}>
            We sent a password reset link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Button
            label="Back to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.backBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.8} />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.heading}>Forgot password?</Text>
        <Text style={styles.subheading}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

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
          containerStyle={styles.inputGap}
        />

        <Button
          label="Send Reset Email"
          onPress={handleSend}
          isLoading={isLoading}
          style={styles.sendBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 60,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: 40,
  },
  heading: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  subheading: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
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
    marginTop: 0,
  },
  sendBtn: {
    marginTop: 24,
  },

  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successHeading: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  successBody: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  emailHighlight: {
    color: Colors.accent,
    fontFamily: 'Manrope_600SemiBold',
  },
  backBtn: {
    marginTop: 8,
  },
});
