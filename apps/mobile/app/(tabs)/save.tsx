import { View, Text, StyleSheet } from 'react-native';
import { PlusCircle } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Theme';

export default function SaveScreen() {
  return (
    <View style={styles.container}>
      <PlusCircle color={Colors.accent} size={48} strokeWidth={1.5} />
      <Text style={styles.heading}>Save a Song</Text>
      <Text style={styles.body}>Share a Reel, paste a URL, or search manually.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  heading: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  body: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
