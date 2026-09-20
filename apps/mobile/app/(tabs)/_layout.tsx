import { Tabs } from 'expo-router';
import { View, Pressable, StyleSheet, type GestureResponderEvent } from 'react-native';
import { Home, Search, PlusCircle, Library, User } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

function SaveTabButton({ onPress, children }: {
  onPress?: (e: GestureResponderEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={styles.saveButton}>
      <View style={styles.saveButtonInner}>
        {children}
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgPrimary,
          borderTopColor: Colors.cardElevated,
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Manrope_500Medium',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Search color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="save"
        options={{
          title: '',
          tabBarIcon: () => (
            <PlusCircle
              color={Colors.accent}
              size={40}
              strokeWidth={1.5}
              fill={Colors.bgPrimary}
            />
          ),
          tabBarButton: (props) => (
            <SaveTabButton onPress={props.onPress ?? undefined}>
              {props.children}
            </SaveTabButton>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Library color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  saveButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bgPrimary,
  },
});
