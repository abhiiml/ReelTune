import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Theme';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search</Text>
      <Text style={styles.body}>Find songs by title, artist, or Reel URL.</Text>
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
