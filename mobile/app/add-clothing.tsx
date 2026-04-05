import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Alert, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../store/AppContext';
import { BrandBadge } from '../components/Common/BrandBadge';
import { TemperatureBar } from '../components/Common/TemperatureBar';
import type { ClothingItem, Category } from '../db/types';
import { C } from '../utils/colors';

const WARDROBE_DIR = (FileSystem.documentDirectory ?? '') + 'wardrobe/';

async function saveImageToLocal(uri: string): Promise<string> {
  await FileSystem.makeDirectoryAsync(WARDROBE_DIR, { intermediates: true });
  const ext = uri.split('.').pop() || 'jpg';
  const dest = `${WARDROBE_DIR}${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export default function AddClothingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { categories, clothing, addClothing, updateClothing, selectedCategoryId, getAllBrands } = useApp();

  const editItem = id ? clothing.find(c => c.id === id) : null;

  const [images, setImages] = useState<string[]>(editItem?.images ?? []);
  const [coverIndex, setCoverIndex] = useState(editItem?.coverIndex ?? 0);
  const [brand, setBrand] = useState(editItem?.brand ?? '');
  const [categoryId, setCategoryId] = useState(
    editItem?.categoryId ?? selectedCategoryId ?? categories[0]?.id ?? ''
  );
  const [tempEnabled, setTempEnabled] = useState(editItem?.tempMin != null);
  const [tempMin, setTempMin] = useState(editItem?.tempMin ?? 15);
  const [tempMax, setTempMax] = useState(editItem?.tempMax ?? 25);
  const [price, setPrice] = useState(editItem?.price?.toString() ?? '');
  const [purchaseDate, setPurchaseDate] = useState(editItem?.purchaseDate ?? '');
  const [purchaseUrl, setPurchaseUrl] = useState(editItem?.purchaseUrl ?? '');
  const [notes, setNotes] = useState(editItem?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);

  const allBrands = getAllBrands();

  useEffect(() => {
    if (!brand.trim()) { setBrandSuggestions([]); return; }
    setBrandSuggestions(
      allBrands.filter(b => b.toLowerCase().includes(brand.toLowerCase()) && b !== brand).slice(0, 5)
    );
  }, [brand]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (result.canceled) return;
    const uris = await Promise.all(result.assets.map(a => saveImageToLocal(a.uri)));
    setImages(prev => [...prev, ...uris]);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('需要相机权限'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (result.canceled) return;
    const uri = await saveImageToLocal(result.assets[0].uri);
    setImages(prev => [...prev, uri]);
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (coverIndex >= next.length) setCoverIndex(Math.max(0, next.length - 1));
      return next;
    });
  };

  const handleSave = async () => {
    if (!brand.trim() || !categoryId) return;
    setSaving(true);
    const data: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'> = {
      categoryId, images, coverIndex, brand: brand.trim(),
      tempMin: tempEnabled ? tempMin : undefined,
      tempMax: tempEnabled ? tempMax : undefined,
      price: price ? parseFloat(price) : undefined,
      purchaseDate: purchaseDate || undefined,
      purchaseUrl: purchaseUrl || undefined,
      notes: notes || undefined,
      sortOrder: editItem?.sortOrder ?? clothing.filter(c => c.categoryId === categoryId).length,
    };
    if (editItem) {
      updateClothing(editItem.id, data);
    } else {
      addClothing(data);
    }
    setSaving(false);
    router.back();
  };

  const renderCategoryOption = (cat: Category, depth = 0): React.ReactNode => {
    const children = categories.filter(c => c.parentId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder);
    const isSelected = categoryId === cat.id;
    return (
      <View key={cat.id}>
        <TouchableOpacity
          style={[styles.catOption, isSelected && styles.catOptionSelected, { paddingLeft: 12 + depth * 14 }]}
          onPress={() => setCategoryId(cat.id)}
        >
          {cat.icon ? <Text style={{ fontSize: 14 }}>{cat.icon}</Text> : null}
          <Text style={[styles.catOptionText, isSelected && styles.catOptionTextSelected]}>{cat.name}</Text>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        {children.map(child => renderCategoryOption(child, depth + 1))}
      </View>
    );
  };

  const topLevel = categories.filter(c => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editItem ? '编辑衣物' : '添加衣物'}</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, (!brand.trim() || !categoryId || saving) && styles.saveBtnDisabled]}
          disabled={!brand.trim() || !categoryId || saving}
        >
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>保存</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>图片</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.imgThumb, idx === coverIndex && styles.imgThumbCover]}
                onPress={() => setCoverIndex(idx)}
                onLongPress={() => Alert.alert('', '', [
                  { text: '设为封面', onPress: () => setCoverIndex(idx) },
                  { text: '删除图片', style: 'destructive', onPress: () => removeImage(idx) },
                  { text: '取消', style: 'cancel' },
                ])}
              >
                <Image source={{ uri }} style={styles.imgPreview} />
                {idx === coverIndex && (
                  <View style={styles.coverBadge}><Text style={styles.coverText}>封面</Text></View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
              <Text style={styles.addImgIcon}>🖼️</Text>
              <Text style={styles.addImgText}>相册</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addImgBtn} onPress={takePhoto}>
              <Text style={styles.addImgIcon}>📷</Text>
              <Text style={styles.addImgText}>拍照</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Brand */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>品牌 *</Text>
          <View style={styles.brandRow}>
            {brand ? <BrandBadge brand={brand} size={30} /> : null}
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="如：Nike、Uniqlo..."
              placeholderTextColor={C.textPlaceholder}
            />
          </View>
          {brandSuggestions.length > 0 && (
            <View style={styles.suggestions}>
              {brandSuggestions.map(b => (
                <TouchableOpacity key={b} style={styles.suggestion} onPress={() => { setBrand(b); setBrandSuggestions([]); }}>
                  <BrandBadge brand={b} size={22} />
                  <Text style={styles.suggestionText}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>分类 *</Text>
          <View style={styles.catList}>
            {topLevel.map(cat => renderCategoryOption(cat))}
          </View>
        </View>

        {/* Temperature */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>推荐穿着温度</Text>
            <TouchableOpacity
              style={[styles.toggle, tempEnabled && styles.toggleOn]}
              onPress={() => setTempEnabled(!tempEnabled)}
              activeOpacity={0.8}
            >
              <View style={[styles.toggleThumb, tempEnabled && styles.toggleThumbOn]} />
            </TouchableOpacity>
          </View>
          {tempEnabled && (
            <View style={styles.tempBlock}>
              <TemperatureBar min={tempMin} max={tempMax} />
              <View style={styles.tempSliders}>
                <View style={styles.sliderWrap}>
                  <Text style={styles.sliderLabel}>最低 {tempMin}°C</Text>
                  <View style={styles.sliderBtns}>
                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setTempMin(v => Math.max(-10, v - 1))}>
                      <Text style={styles.sliderBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.sliderVal}>{tempMin}</Text>
                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setTempMin(v => Math.min(v + 1, tempMax - 1))}>
                      <Text style={styles.sliderBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.sliderWrap}>
                  <Text style={styles.sliderLabel}>最高 {tempMax}°C</Text>
                  <View style={styles.sliderBtns}>
                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setTempMax(v => Math.max(tempMin + 1, v - 1))}>
                      <Text style={styles.sliderBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.sliderVal}>{tempMax}</Text>
                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setTempMax(v => Math.min(40, v + 1))}>
                      <Text style={styles.sliderBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>价格（元）</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>¥</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={C.textPlaceholder}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Purchase date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>购买日期</Text>
          <TextInput
            style={styles.input}
            value={purchaseDate}
            onChangeText={setPurchaseDate}
            placeholder="2024-01-01"
            placeholderTextColor={C.textPlaceholder}
          />
        </View>

        {/* Purchase URL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>购买链接</Text>
          <TextInput
            style={styles.input}
            value={purchaseUrl}
            onChangeText={setPurchaseUrl}
            placeholder="https://..."
            placeholderTextColor={C.textPlaceholder}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="颜色、尺码、穿搭建议..."
            placeholderTextColor={C.textPlaceholder}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  headerBtn: { padding: 4 },
  headerBtnText: { fontSize: 16, color: C.textSecondary },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
  saveBtn: { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  input: {
    flex: 1, borderWidth: 1, borderColor: C.borderLight, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    color: C.textPrimary, backgroundColor: C.bgCard,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prefix: { fontSize: 16, color: C.textMuted },
  textArea: { height: 80, textAlignVertical: 'top' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  suggestions: {
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderLight,
    borderRadius: 10, marginTop: 4, overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  suggestionText: { fontSize: 14, color: C.textPrimary },
  catList: { borderWidth: 1, borderColor: C.borderLight, borderRadius: 10, overflow: 'hidden', backgroundColor: C.bgCard },
  catOption: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingRight: 12, paddingLeft: 12,
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  catOptionSelected: { backgroundColor: C.accentLight },
  catOptionText: { flex: 1, fontSize: 14, color: C.textPrimary },
  catOptionTextSelected: { color: C.accent, fontWeight: '600' },
  checkmark: { fontSize: 14, color: C.accent },
  toggle: {
    width: 44, height: 26, borderRadius: 13, backgroundColor: C.bgStrong,
    justifyContent: 'center', padding: 2,
  },
  toggleOn: { backgroundColor: C.accent },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { transform: [{ translateX: 18 }] },
  tempBlock: { gap: 12 },
  tempSliders: { flexDirection: 'row', gap: 12 },
  sliderWrap: { flex: 1, alignItems: 'center', gap: 6 },
  sliderLabel: { fontSize: 12, color: C.textMuted },
  sliderBtns: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sliderBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.bgStrong, alignItems: 'center', justifyContent: 'center',
  },
  sliderBtnText: { fontSize: 18, color: C.textPrimary, fontWeight: '600' },
  sliderVal: { fontSize: 16, fontWeight: '700', color: C.textPrimary, width: 30, textAlign: 'center' },
  imgThumb: { width: 80, height: 80, borderRadius: 10, marginRight: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  imgThumbCover: { borderColor: C.accent },
  imgPreview: { width: '100%', height: '100%' },
  coverBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(74,103,65,0.85)', paddingVertical: 3, alignItems: 'center' },
  coverText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  addImgBtn: {
    width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderColor: C.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginRight: 8,
    backgroundColor: C.bgMuted,
  },
  addImgIcon: { fontSize: 22 },
  addImgText: { fontSize: 11, color: C.textMuted, marginTop: 3 },
});
