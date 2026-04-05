import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import type { ClothingItem } from '../../db/types';
import { BrandBadge } from '../Common/BrandBadge';
import { TemperatureBar } from '../Common/TemperatureBar';
import { C } from '../../utils/colors';

const CARD_WIDTH = (Dimensions.get('window').width - 16 * 2 - 10) / 2;

interface Props {
  item: ClothingItem;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ClothingCard({ item, onPress, onLongPress }: Props) {
  const cover = item.images[item.coverIndex] ?? item.images[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imgContainer}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
          </View>
        )}

        {/* Brand badge */}
        <View style={styles.badgeWrap}>
          <BrandBadge brand={item.brand} size={30} />
        </View>

        {/* Multi-image count */}
        {item.images.length > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{item.images.length}张</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
        {item.tempMin != null && item.tempMax != null && (
          <TemperatureBar min={item.tempMin} max={item.tempMax} compact />
        )}
        {item.price != null && (
          <Text style={styles.price}>¥{item.price.toLocaleString()}</Text>
        )}
        {item.notes ? (
          <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH, backgroundColor: C.bgCard,
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: C.borderLight,
    shadowColor: '#3d2410', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  imgContainer: { aspectRatio: 3 / 4, backgroundColor: C.bgMuted, position: 'relative' },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 32, opacity: 0.4 },
  badgeWrap: { position: 'absolute', top: 8, right: 8 },
  countBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  countText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  info: { padding: 8, gap: 3 },
  brand: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  price: { fontSize: 12, color: C.textMuted },
  notes: { fontSize: 11, color: C.textPlaceholder },
});
