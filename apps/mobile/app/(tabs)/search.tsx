import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, XCircle } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radius } from '../../constants/Theme';
import { useSearchSongs } from '../../hooks/useSearchSongs';
import { useDebounce } from '../../hooks/useDebounce';
import { SongRow } from '../../components/ui/SongRow';
import type { Song } from '@reeltune/types';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: songs, isLoading, isError, error } = useSearchSongs(debouncedQuery);

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Text style={styles.errorSubtext}>{error?.message || 'Failed to search songs'}</Text>
        </View>
      );
    }

    if (debouncedQuery.trim() === '') {
      return (
        <View style={styles.centerContent}>
          <Search size={48} color={Colors.cardElevated} style={{ marginBottom: Spacing.md }} />
          <Text style={styles.emptyText}>Find songs by title, artist, or album</Text>
        </View>
      );
    }

    if (songs && songs.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No results found for "{debouncedQuery}"</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.heading}>Search</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="What do you want to listen to?"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <XCircle
              size={20}
              color={Colors.textMuted}
              style={styles.clearIcon}
              onPress={() => setQuery('')}
            />
          )}
        </View>
      </View>

      <FlatList
        data={songs || []}
        keyExtractor={(item: Song) => item.id}
        renderItem={({ item }) => (
          <SongRow 
            song={item} 
            onPress={() => router.push(`/song/${item.id}` as never)}
            onMenuPress={() => console.log('Open Song Menu', item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState()}
        keyboardShouldPersistTaps="handled"
        indicatorStyle="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  heading: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.textPrimary,
    ...Typography.body,
  },
  clearIcon: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    minHeight: 300,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    ...Typography.h3,
    color: Colors.error,
    marginBottom: Spacing.xs,
  },
  errorSubtext: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
