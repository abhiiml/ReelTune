import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { X, CheckCircle2, AlertTriangle, Plus } from 'lucide-react-native';
import type { IdentifyReelResponse } from '../../hooks/useIdentifyReel';

interface Props {
  visible: boolean;
  result: IdentifyReelResponse | null;
  onClose: () => void;
  onAddPlaylist?: (songId: string, songTitle: string, artistName: string) => void;
}

export function IdentificationResultModal({ visible, result, onClose, onAddPlaylist }: Props) {
  if (!result) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {result.success ? 'Song Identified!' : 'Identification Failed'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {result.success ? (
            <View style={styles.successContent}>
              <View style={styles.iconContainer}>
                <CheckCircle2 size={48} color={Colors.success} />
              </View>
              <Text style={styles.songTitle}>{result.title}</Text>
              <Text style={styles.songArtist}>{result.artist}</Text>
              
              {result.songId ? (
                <Pressable 
                  style={styles.addButton}
                  onPress={() => {
                    if (onAddPlaylist && result.title && result.artist && result.songId) {
                      onAddPlaylist(result.songId, result.title, result.artist);
                      onClose();
                    }
                  }}
                >
                  <Plus size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Save to Library</Text>
                </Pressable>
              ) : (
                <Text style={[styles.errorText, { marginTop: Spacing.md }]}>
                  This song was identified but could not be found on Spotify to save.
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.errorContent}>
              <View style={styles.iconContainerError}>
                <AlertTriangle size={48} color={Colors.error} />
              </View>
              <Text style={styles.errorText}>
                {result.message || "We couldn't identify the song from this Reel. Make sure the URL is correct and the video is public."}
              </Text>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    padding: Spacing.xl,
    paddingBottom: Spacing['2xl'] * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  successContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  songTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  songArtist: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 9999,
    width: '100%',
    gap: Spacing.sm,
  },
  addButtonText: {
    ...Typography.h3,
    color: '#fff',
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  iconContainerError: {
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
