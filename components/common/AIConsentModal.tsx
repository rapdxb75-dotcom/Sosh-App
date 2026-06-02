import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, X } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/userSlice';
import AIDisclosureView from './AIDisclosureView';

const { height } = Dimensions.get('window');

interface AIConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showFooter?: boolean;
}

const AIConsentModal: React.FC<AIConsentModalProps> = ({ visible, onClose, onAccept, showFooter = true }) => {
  const dispatch = useDispatch();

  const handleAgree = async () => {
    try {
      // @ts-ignore
      await dispatch(updateUser({ aiConsent: true }));
      if (onAccept) {
        onAccept();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving AI consent:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['rgba(20, 20, 20, 0.95)', 'rgba(0, 0, 0, 0.98)']}
            style={styles.card}
          >
            {/* Close Button */}
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={20} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>

            <AIDisclosureView />

            {showFooter && (
              <View style={styles.footer}>
                <TouchableOpacity 
                  onPress={onClose}
                  style={styles.cancelButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Not Now</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleAgree}
                  style={styles.agreeButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#1DB954', '#158c3f']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.agreeGradient}
                  >
                    <Text style={styles.agreeButtonText}>I Agree</Text>
                    <ArrowRight size={20} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 450,
    height: height * 0.8,
  },
  card: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  agreeButton: {
    flex: 1.8,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  agreeGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  agreeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default AIConsentModal;
