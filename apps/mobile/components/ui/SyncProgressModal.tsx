import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Pressable, Linking } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { CheckCircle2, AlertTriangle, XCircle, ExternalLink, X } from 'lucide-react-native';

interface Props {
  jobId: string | null;
  onClose: () => void;
}

export function SyncProgressModal({ jobId, onClose }: Props) {
  const { data, isLoading } = useSyncStatus(jobId);

  if (!jobId) return null;

  const isCompleted = data?.state === 'completed';
  const isFailed = data?.state === 'failed';
  const isActive = data?.state === 'active' || data?.state === 'waiting' || isLoading;

  return (
    <Modal visible={!!jobId} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Spotify Sync</Text>
            {(!isActive || isCompleted || isFailed) && (
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <X size={24} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {isActive && (
            <View style={styles.activeState}>
              <ActivityIndicator size="large" color={Colors.spotify} />
              <Text style={styles.statusText}>
                Syncing... {data?.progress || 0}%
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${data?.progress || 0}%` }]} />
              </View>
            </View>
          )}

          {isCompleted && data?.result && (
            <View style={styles.resultState}>
              <View style={styles.resultRow}>
                <CheckCircle2 size={24} color={Colors.success} />
                <Text style={styles.resultText}>{data.result.matched} Songs Matched</Text>
              </View>
              <View style={styles.resultRow}>
                <AlertTriangle size={24} color={Colors.accent} />
                <Text style={styles.resultText}>{data.result.skipped} Songs Skipped</Text>
              </View>
              <View style={styles.resultRow}>
                <XCircle size={24} color={Colors.error} />
                <Text style={styles.resultText}>{data.result.unavailable} Songs Unavailable</Text>
              </View>

              {data.result.spotifyPlaylistUrl && (
                <Pressable
                  style={styles.spotifyButton}
                  onPress={() => Linking.openURL(data.result!.spotifyPlaylistUrl!)}
                >
                  <ExternalLink size={20} color="#fff" />
                  <Text style={styles.spotifyButtonText}>Open in Spotify</Text>
                </Pressable>
              )}
            </View>
          )}

          {isFailed && (
            <View style={styles.failedState}>
              <XCircle size={48} color={Colors.error} />
              <Text style={styles.failedText}>Sync Failed</Text>
              <Text style={styles.errorText}>{data?.failedReason || 'An unknown error occurred'}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.xl,
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
  activeState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  statusText: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.cardElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.spotify,
  },
  resultState: {
    gap: Spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bgPrimary,
    padding: Spacing.md,
    borderRadius: Radius.btn,
  },
  resultText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  spotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.spotify,
    paddingVertical: Spacing.md,
    borderRadius: 9999,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  spotifyButtonText: {
    ...Typography.body,
    color: '#fff',
    fontFamily: 'Manrope_700Bold',
  },
  failedState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  failedText: {
    ...Typography.h2,
    color: Colors.error,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
