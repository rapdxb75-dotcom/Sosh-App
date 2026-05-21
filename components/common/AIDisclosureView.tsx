import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

export const PROVIDERS = [
  { name: 'Anthropic (Claude)', purpose: 'Smart Content Generation & Chat', icon: <Image source={require('../../assets/icons/provider_claude_actual.png')} style={{ width: 20, height: 20, borderRadius: 4 }} /> },
  { name: 'Poppy AI', purpose: 'Custom Business Intelligence & Chat', icon: <Image source={require('../../assets/icons/provider_poppy_actual.png')} style={{ width: 20, height: 20, borderRadius: 4 }} /> },
  { name: 'Ayrshare', purpose: 'Social Media Publishing & Connectivity', icon: <Image source={require('../../assets/icons/provider_ayrshare.png')} style={{ width: 20, height: 20, borderRadius: 4 }} /> },
  { name: 'Zernio', purpose: 'Advanced Social Analytics', icon: <Image source={require('../../assets/icons/provider_zernio.png')} style={{ width: 20, height: 20, borderRadius: 4 }} /> },
];

export const DATA_SHARED = [
  { title: '1. Account Data', desc: 'Username, profile info, and brand data for platform identification.' },
  { title: '2. Prompts & Input', desc: 'User-provided prompts, chat messages, and content data for AI processing.' },
  { title: '3. Media Assets', desc: 'Captions, photos, and videos you choose to process or publish.' },
];

interface AIDisclosureViewProps {
  showTitle?: boolean;
}

const AIDisclosureView: React.FC<AIDisclosureViewProps> = ({ showTitle = true }) => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        {/* <View style={styles.iconContainer}>
          <View style={styles.glowOrb} />
          <LinearGradient
            colors={['rgba(29, 185, 84, 0.25)', 'rgba(29, 185, 84, 0.05)']}
            style={styles.iconCircle}
          >
            <ShieldCheck size={28} color="#00FF94" strokeWidth={1.5} />
          </LinearGradient>
        </View> */}
        {showTitle && <Text className="text-white text-2xl font-bold mt-6 text-center" style={styles.title}>AI Data Sharing</Text>}
        <Text style={styles.subtitle}>
          At Sosh, we use world-class AI to power your growth. To enable these features, some data is shared with our trusted partners.
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Trusted Providers</Text>
          <View style={styles.badgeLine} />
        </View>
        <View style={styles.providersList}>
          {PROVIDERS.map((p, i) => (
            <View key={i} style={[styles.providerItem, i < PROVIDERS.length - 1 && styles.borderBottom]}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)']}
                style={styles.providerIconContainer}
              >
                {p.icon}
              </LinearGradient>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{p.name}</Text>
                <Text style={styles.providerPurpose}>{p.purpose}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>What is Shared?</Text>
          <View style={styles.badgeLine} />
        </View>
        <View style={styles.dataGrid}>
          {DATA_SHARED.map((item, i) => (
            <View key={i} style={styles.dataItem}>
              <View style={styles.dataContent}>
                <Text style={styles.dataTitle}>{item.title}</Text>
                <Text style={styles.dataDesc} numberOfLines={2}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <LinearGradient
        colors={['rgba(29, 185, 84, 0.1)', 'rgba(29, 185, 84, 0.02)']}
        style={styles.privacyNote}
      >
        <Lock size={16} color="#00FF94" style={{ marginTop: 2 }} />
        <Text style={styles.privacyNoteText}>
          Your data is <Text style={styles.highlight}>encrypted during transmission</Text> and is only used to generate content or publish posts. We never sell your personal information.
        </Text>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  glowOrb: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00FF94',
    opacity: 0.15,
    shadowColor: '#00FF94',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 148, 0.4)',
    shadowColor: '#00FF94',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  badgeLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 16,
  },
  providersList: {
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  providerIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.2,
  },
  providerPurpose: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 3,
    fontWeight: '500',
  },
  dataGrid: {
    gap: 12,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },

  dataContent: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  dataDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 18,
  },
  privacyNote: {
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.3)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  privacyNoteText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  highlight: {
    color: '#00FF94',
    fontWeight: '700',
  },
});

export default AIDisclosureView;
