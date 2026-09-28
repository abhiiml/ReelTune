import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';

interface WaveformAnimationProps {
  barCount?: number;
  height?: number;
  color?: string;
  active?: boolean;
}

export function WaveformAnimation({
  barCount = 7,
  height = 48,
  color = Colors.accent,
  active = true,
}: WaveformAnimationProps) {
  const animatedValues = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(0.2)),
  ).current;

  useEffect(() => {
    if (!active) return;

    const animations = animatedValues.map((anim, index) => {
      const minHeight = 0.15;
      const maxHeight = 0.6 + ((index % 3) * 0.2);
      const duration = 400 + (index * 90) % 450;

      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: maxHeight,
            duration: duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: minHeight,
            duration: duration * 0.9,
            useNativeDriver: false,
          }),
        ]),
      );
    });

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [active, animatedValues, barCount]);

  return (
    <View style={[styles.container, { height }]}>
      {animatedValues.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [height * 0.1, height],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bar: {
    width: 5,
    borderRadius: 3,
  },
});
