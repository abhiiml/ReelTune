import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { X } from 'lucide-react-native';

interface DuplicateSaveModalProps {
  visible: boolean;
  onClose: () => void;
  onAddToPlaylist: () => void;
  title?: string;
}

export function DuplicateSaveModal({
  visible,
  onClose,
  onAddToPlaylist,
  title
}: DuplicateSaveModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Already Saved</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.modalBody}>
            {title ? `"${title}" is already in your library. Add to another playlist?` : 'This song is already in your library. Add to another playlist?'}
          </Text>
          <Pressable
            style={[styles.actionButton, styles.primaryAction, { marginTop: Spacing.md }]}
            onPress={() => {
              onClose();
              onAddToPlaylist();
            }}
          >
            <Text style={styles.primaryActionText}>Add to Playlist</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.secondaryAction, { marginTop: Spacing.md }]}
            onPress={onClose}
          >
            <Text style={styles.secondaryActionText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Radius.sheet,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: Radius.btn,
    gap: Spacing.sm,
  },
  primaryAction: {
    backgroundColor: Colors.accent,
  },
  primaryActionText: {
    ...Typography.h3,
    color: Colors.bgPrimary,
  },
  secondaryAction: {
    backgroundColor: Colors.cardElevated,
  },
  secondaryActionText: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
});
