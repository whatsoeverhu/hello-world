import { View, Text, StyleSheet } from 'react-native';
import { getBrandColor, getBrandInitials } from '../../utils/brandLogos';

interface Props {
  brand: string;
  size?: number;
}

export function BrandBadge({ brand, size = 36 }: Props) {
  const bg = getBrandColor(brand);
  const initials = getBrandInitials(brand);
  const fontSize = Math.round(size * 0.35);

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size * 0.22, backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
