import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useToastStore } from '../../store/useToastStore';
import { Toast } from './Toast';

export function ToastManager() {
  const { toasts, hideToast } = useToastStore();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onHide={() => hideToast(toast.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 10,
    justifyContent: 'flex-start',
  },
});
