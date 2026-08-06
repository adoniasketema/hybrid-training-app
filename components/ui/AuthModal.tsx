import React from 'react';
import { View, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function AuthModal({ visible, onClose, children }: AuthModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView 
        style={styles.absoluteFill} 
        intensity={Platform.OS === 'web' ? 80 : 30} 
        tint="dark"
      >
        <Pressable style={styles.absoluteFill} onPress={onClose} />
        <View style={styles.container}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <IconSymbol name="xmark" size={20} color="#fff" />
            </Pressable>
            {children}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    pointerEvents: 'box-none',
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#12141A',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  }
});
