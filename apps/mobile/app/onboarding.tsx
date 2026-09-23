import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, Radius } from '../constants/Theme';
import { Search, Download, ListMusic, RefreshCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  const completeOnboarding = async () => {
    await SecureStore.setItemAsync('onboardingComplete', 'true');
    router.replace('/(auth)/register');
  };

  const handleNext = () => {
    if (activeIndex === ONBOARDING_DATA.length - 1) {
      completeOnboarding();
    } else {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View />
        <Pressable onPress={completeOnboarding} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {ONBOARDING_DATA.map((item, index) => {
          const Icon = item.Icon;
          return (
            <View key={index} style={styles.slide}>
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

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {activeIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
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
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(215, 122, 112, 0.1)',
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
  },
  buttonText: {
    ...Typography.h3,
    color: '#fff',
  },
});
