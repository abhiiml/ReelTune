import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Switch, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { useCreatePlaylist } from '../../hooks/useCreatePlaylist';

export default function CreatePlaylistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  
  const { mutate: createPlaylist, isPending, error } = useCreatePlaylist();

  const handleCreate = () => {
    if (!name.trim()) return;
    
    createPlaylist(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        isPrivate,
      },
      {
        onSuccess: () => {
          // If we had a playlist details screen built, we would go there.
          // For now, just go back.
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/library');
          }
        }
      }
    );
  };

  const isFormValid = name.trim().length > 0 && name.length <= 50;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: Colors.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>New Playlist</Text>
        <View style={{ width: 40 }} /> {/* Spacer to center title */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to create playlist. Try again.</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="My Awesome Playlist"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={50}
            autoFocus
          />
          <Text style={styles.charCount}>{name.length}/50</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's this playlist about?"
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={300}
          />
        </View>

        <View style={styles.switchGroup}>
          <View>
            <Text style={styles.switchLabel}>Private Playlist</Text>
            <Text style={styles.switchDescription}>Only you can see this playlist</Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: Colors.cardElevated, true: Colors.accent }}
            thumbColor={Platform.OS === 'ios' ? undefined : isPrivate ? Colors.bgPrimary : Colors.textSecondary}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <Pressable
          style={[styles.createButton, !isFormValid && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!isFormValid || isPending}
        >
          {isPending ? (
            <ActivityIndicator color={Colors.bgPrimary} />
          ) : (
            <Text style={styles.createButtonText}>Create Playlist</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardElevated,
  },
  backButton: {
    padding: Spacing.xs,
    width: 40,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  errorContainer: {
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: Radius.btn,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    ...Typography.small,
    color: Colors.error,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.input,
    padding: Spacing.md,
    color: Colors.textPrimary,
    ...Typography.body,
  },
  textArea: {
    minHeight: 100,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  switchLabel: {
    ...Typography.body,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  switchDescription: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardElevated,
  },
  createButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.btn,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.cardElevated,
    opacity: 0.5,
  },
  createButtonText: {
    ...Typography.body,
    fontFamily: 'Manrope_700Bold',
    color: Colors.bgPrimary,
  },
});
