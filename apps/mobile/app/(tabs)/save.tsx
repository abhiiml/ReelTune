import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { Search } from 'lucide-react-native';
import { useShareIntent } from 'expo-share-intent';
import { useIdentifyReel } from '../../hooks/useIdentifyReel';
import { useSaveSong } from '../../hooks/useSaveSong';
import type { IdentifyReelResponse } from '../../hooks/useIdentifyReel';
import { IdentificationResultModal } from '../../components/ui/IdentificationResultModal';

export default function SaveScreen() {
  const [url, setUrl] = useState('');
  const { mutate: identifyReel, isPending } = useIdentifyReel();
  const { mutate: saveSong } = useSaveSong();
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState<IdentifyReelResponse | null>(null);
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (hasShareIntent && shareIntent) {
      const intentRecord = shareIntent as unknown as Record<string, string>;
      const incomingUrl = intentRecord.value || intentRecord.text;
      if (incomingUrl) {
        setUrl(incomingUrl);
        resetShareIntent();
        
        // Auto trigger identification
        handleIdentify(incomingUrl);
      }
    }
  }, [hasShareIntent, shareIntent, resetShareIntent]);

  const handleIdentify = (urlToIdentify?: string) => {
    const targetUrl = typeof urlToIdentify === 'string' ? urlToIdentify : url;
    if (!targetUrl.trim()) return;
    Keyboard.dismiss();
    
    identifyReel(targetUrl.trim(), {
      onSuccess: (data) => {
        setResult(data);
        setModalVisible(true);
      },
      onError: (error: Error) => {
        setResult({
          success: false,
          message: error.message || 'An unexpected error occurred while identifying the song.',
        });
        setModalVisible(true);
      },
    });
  };

  const handleAddPlaylist = (songId: string, title: string, artist: string) => {
    saveSong(songId, {
      onSuccess: (data) => {
        if (data.alreadySaved) {
          Alert.alert('Library', `"${title}" is already in your library!`);
        } else {
          Alert.alert('Success', `Saved "${title}" by ${artist} to your library!`);
        }
      },
      onError: (err) => {
        Alert.alert('Error', `Failed to save song: ${err.message}`);
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Save a Song</Text>
        <Text style={styles.subtitle}>Identify songs from Instagram Reels instantly.</Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Paste Instagram Reel URL here..."
            placeholderTextColor={Colors.textSecondary}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, (!url.trim() || isPending) && styles.buttonDisabled]} 
          onPress={() => handleIdentify()}
          disabled={!url.trim() || isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Identify Song</Text>
          )}
        </TouchableOpacity>
      </View>

      <IdentificationResultModal
        visible={modalVisible}
        result={result}
        onClose={() => setModalVisible(false)}
        onAddPlaylist={handleAddPlaylist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    gap: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    gap: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardElevated,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.btn,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52, // Fixed height to prevent jumping when showing loader
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.h3,
    color: '#fff',
  },
});
