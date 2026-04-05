import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { ClothingItem } from '../../db/types';
import { BrandBadge } from '../Common/BrandBadge';
import { TemperatureBar } from '../Common/TemperatureBar';
import { C } from '../../utils/colors';

interface Props {
  item: ClothingItem;
  onPress: () => void;
}

export function ClothingListRow({ item, onPress }: Props) {
  const cover = item.images[item.coverIndex] ?? item.images[0];
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      {/* Thumbnail */}
      <View style={styles.thumb}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.thumbImg} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={{ fontSize: 20 }}>📷</Text>
          </View>
        )}
      </View>

      <BrandBadge brand={item.brand} size={26} />

      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
        {item.notes ? <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text> : null}
      </View>

      {item.tempMin != null && item.tempMax != null && (
        <View style={styles.tempWrap}>
          <TemperatureBar min={item.tempMin} max={item.tempMax} compact />
        </View>
      )}

      {item.price != null && (
        <Text style={styles.price}>¥{item.price.toLocaleString()}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, backgroundColor: C.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: C.borderLight, marginBottom: 6,
  },
  thumb: { width: 52, height: 52, borderRadius: 10, overflow: 'hidden', backgroundColor: C.bgMuted, flexShrink: 0 },
  thumbImg: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  brand: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  notes: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  tempWrap: { width: 80 },
  price: { fontSize: 13, color: C.textMuted, flexShrink: 0 },
});
