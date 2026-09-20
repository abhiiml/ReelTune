import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Theme';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Library</Text>
      <Text style={styles.body}>Your saved songs will appear here.</Text>
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
  heading: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  body: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
