import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, Radius } from '../constants/Theme';
import { Search, Download, ListMusic, RefreshCw } from 'lucide-react-native';

const ONBOARDING_DATA = [
  {
    title: 'Discover',
    subtitle: 'Identify songs from any Instagram Reel instantly.',
    Icon: Search,
  },
  {
    title: 'Save',
    subtitle: 'Build your personal library in seconds.',
    Icon: Download,
  },
  {
    title: 'Organize',
    subtitle: 'Create custom playlists with ease.',
    Icon: ListMusic,
  },
  {
    title: 'Sync',
    subtitle: 'Sync automatically to Spotify or YouTube Music.',
    Icon: RefreshCw,
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: slideWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const updateIndex = (offsetX: number) => {
    if (slideWidth <= 0) return;
    const rawIndex = Math.round(offsetX / slideWidth);
    const clampedIndex = Math.min(Math.max(0, rawIndex), ONBOARDING_DATA.length - 1);
    setActiveIndex(clampedIndex);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateIndex(event.nativeEvent.contentOffset.x);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateIndex(event.nativeEvent.contentOffset.x);
  };

  const completeOnboarding = async () => {
    await SecureStore.setItemAsync('onboardingComplete', 'true');
    router.replace('/(auth)/register');
  };

  const handleNext = () => {
    if (activeIndex === ONBOARDING_DATA.length - 1) {
      completeOnboarding();
    } else {
      const nextIndex = activeIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
      setActiveIndex(nextIndex);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View />
        <TouchableOpacity onPress={completeOnboarding} style={styles.skipBtn} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={styles.scrollView}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {ONBOARDING_DATA.map((item, index) => {
          const Icon = item.Icon;
          return (
            <View key={index} style={[styles.slide, { width: slideWidth }]}>
              <View style={styles.iconContainer}>
                <Icon size={80} color={Colors.accent} strokeWidth={1.5} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer (Dots + Button) */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, activeIndex === i && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={activeIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
        >
          <Text style={styles.buttonText}>
            {activeIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  skipBtn: {
    padding: Spacing.xs,
  },
  skipText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontFamily: 'Manrope_600SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(217, 154, 91, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.h3,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cardElevated,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.accent,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: Radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: {
    ...Typography.h3,
    color: '#080706',
    fontFamily: 'Manrope_700Bold',
  },
});
