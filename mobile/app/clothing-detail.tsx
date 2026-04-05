import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Dimensions, Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../store/AppContext';
import { BrandBadge } from '../components/Common/BrandBadge';
import { TemperatureBar } from '../components/Common/TemperatureBar';
import { C } from '../utils/colors';

const { width } = Dimensions.get('window');

export default function ClothingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clothing, categories, deleteClothing, getCategoryById } = useApp();
  const [activeImg, setActiveImg] = useState(0);

  const item = clothing.find(c => c.id === id);
  if (!item) return null;

  const category = getCategoryById(item.categoryId);

  const handleDelete = () => {
    Alert.alert('删除衣物', '确认删除这件衣物？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', style: 'destructive', onPress: () => {
          deleteClothing(item.id);
          router.back();
        }
      },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* Image carousel */}
      <ScrollView
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        onMomentumScrollEnd={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {item.images.length > 0 ? item.images.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={[styles.carouselImg, { width }]} resizeMode="cover" />
        )) : (
          <View style={[styles.carouselImg, styles.noImg, { width }]}>
            <Text style={styles.noImgText}>📷</Text>
          </View>
        )}
      </ScrollView>

      {/* Image dots */}
      {item.images.length > 1 && (
        <View style={styles.dots}>
          {item.images.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
          ))}
        </View>
      )}

      {/* Back & action buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
          <Text style={styles.topBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => router.push({ pathname: '/add-clothing', params: { id: item.id } })}
          >
            <Text style={styles.topBtnIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn} onPress={handleDelete}>
            <Text style={styles.topBtnIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Details */}
      <ScrollView style={styles.details} contentContainerStyle={styles.detailsContent}>
        {/* Brand row */}
        <View style={styles.brandRow}>
          <BrandBadge brand={item.brand} size={44} />
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>{item.brand}</Text>
            {category && (
              <Text style={styles.categoryLabel}>
                {category.icon ? `${category.icon} ` : ''}{category.name}
              </Text>
            )}
          </View>
        </View>

        {/* Temperature */}
        {item.tempMin != null && item.tempMax != null && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>推荐穿着温度</Text>
            <TemperatureBar min={item.tempMin} max={item.tempMax} />
          </View>
        )}

        {/* Price & Date */}
        {(item.price != null || item.purchaseDate) && (
          <View style={styles.infoRow}>
            {item.price != null && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>价格</Text>
                <Text style={styles.infoValue}>¥{item.price.toLocaleString()}</Text>
              </View>
            )}
            {item.purchaseDate && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>购买日期</Text>
                <Text style={styles.infoValue}>{item.purchaseDate}</Text>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {item.notes && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>备注</Text>
            <Text style={styles.infoValue}>{item.notes}</Text>
          </View>
        )}

        {/* Purchase URL */}
        {item.purchaseUrl && (
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => item.purchaseUrl && Linking.openURL(item.purchaseUrl)}
          >
            <Text style={styles.linkLabel}>🔗 购买链接</Text>
            <Text style={styles.linkUrl} numberOfLines={1}>{item.purchaseUrl}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  carousel: { height: 380, backgroundColor: C.bgMuted },
  carouselImg: { height: 380 },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  noImgText: { fontSize: 64, opacity: 0.3 },
  dots: {
    position: 'absolute', top: 348, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 16 },
  topBar: {
    position: 'absolute', top: 44, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  topRight: { flexDirection: 'row', gap: 8 },
  topBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  topBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 30 },
  topBtnIcon: { fontSize: 16 },
  details: { flex: 1 },
  detailsContent: { padding: 16, gap: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  brandInfo: { flex: 1 },
  brandName: { fontSize: 22, fontWeight: '700', color: C.textPrimary },
  categoryLabel: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  infoCard: { backgroundColor: C.bgCard, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.borderLight, gap: 8 },
  infoRow: { flexDirection: 'row', gap: 10 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, color: C.textPrimary },
  linkCard: { backgroundColor: C.bgCard, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.borderLight },
  linkLabel: { fontSize: 13, fontWeight: '600', color: C.accent },
  linkUrl: { fontSize: 12, color: C.textMuted, marginTop: 4 },
});
