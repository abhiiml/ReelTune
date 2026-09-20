import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ReelTune</Text>
      <Text style={styles.subtitle}>Your music, discovered.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    ...Typography.h1,
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
