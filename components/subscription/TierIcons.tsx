import { BriefcaseBusiness, Crown, User } from 'lucide-react-native';
import { View } from 'react-native';

interface TierIconProps {
  size?: number;
  color?: string;
}

export const FreeTierIcon = ({ size = 20, color = "#FFFFFF" }: TierIconProps) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <User size={size} color={color} strokeWidth={2.2} />
    </View>
  );
};

export const ProTierIcon = ({ size = 20, color = "#3b82f6" }: TierIconProps) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Crown size={size} color={color} strokeWidth={2.2} />
    </View>
  );
};

export const BusinessTierIcon = ({ size = 20, color = "#FF8A00" }: TierIconProps) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <BriefcaseBusiness size={size} color={color} strokeWidth={2.2} />
    </View>
  );
};
