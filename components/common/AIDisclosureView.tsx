import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ShieldCheck, Cpu, Database, Share2, Sparkles } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export const PROVIDERS = [
  { name: 'Anthropic (Claude)', purpose: 'Smart Content Generation & Chat', icon: <Cpu size={20} color="#1DB954" /> },
  { name: 'Poppy AI', purpose: 'Custom Business Intelligence & Chat', icon: <Sparkles size={20} color="#1DB954" /> },
  { name: 'Ayrshare', purpose: 'Social Media Publishing & Connectivity', icon: <Database size={20} color="#1DB954" /> },
  { name: 'Zernio', purpose: 'Advanced Social Analytics', icon: <Share2 size={20} color="#1DB954" /> },
];

export const DATA_SHARED = [
  { icon: <Database size={22} color="#1DB954" />, title: 'Account Data', desc: 'Username, profile info, and brand data for platform identification.' },
  { icon: <Cpu size={22} color="#1DB954" />, title: 'Prompts & Input', desc: 'User-provided prompts, chat messages, and content data for AI processing.' },
  { icon: <Share2 size={22} color="#1DB954" />, title: 'Media Assets', desc: 'Captions, photos, and videos you choose to process or publish.' },
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
        <View style={styles.iconCircle}>
          <ShieldCheck size={40} color="#1DB954" />
        </View>
        {showTitle && <Text style={styles.title}>AI Data Sharing</Text>}
        <Text style={styles.subtitle}>
          At Sosh, we use world-class AI to power your growth. To enable these features, some data is shared with our trusted partners.
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Trusted Providers</Text>
        <View style={styles.providersList}>
          {PROVIDERS.map((p, i) => (
            <View key={i} style={[styles.providerItem, i < PROVIDERS.length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
              <View style={styles.providerIconContainer}>{p.icon}</View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{p.name}</Text>
                <Text style={styles.providerPurpose}>{p.purpose}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>What is Shared?</Text>
        <View style={styles.dataGrid}>
          {DATA_SHARED.map((item, i) => (
            <View key={i} style={styles.dataItem}>
              <View style={styles.dataIcon}>{item.icon}</View>
              <View style={styles.dataContent}>
                <Text style={styles.dataTitle}>{item.title}</Text>
                <Text style={styles.dataDesc} numberOfLines={2}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyNoteText}>
          Your data is <Text style={styles.highlight}>encrypted during transmission</Text> and is only used to generate content or publish posts on your behalf. We never sell your personal information.
        </Text>
      </View>
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
    marginTop: 20,
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    marginLeft: 4,
  },
  providersList: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
  },
  providerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  providerPurpose: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 1,
  },
  dataGrid: {
    gap: 10,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dataIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dataContent: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  dataDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
    lineHeight: 16,
  },
  privacyNote: {
    marginTop: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  privacyNoteText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  highlight: {
    color: '#1DB954',
    fontWeight: '600',
  },
});

export default AIDisclosureView;
