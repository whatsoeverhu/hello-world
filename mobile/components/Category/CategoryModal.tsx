import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Pressable,
} from 'react-native';
import type { Category } from '../../db/types';
import { C } from '../../utils/colors';

const ICONS = ['👔','👕','👗','👖','🧥','🥼','🧣','🧤','👟','👠','👜','🎒','⌚','💍','🕶️','🧢','📦','👒'];
const COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ec4899','#ef4444','#6366f1','#f97316','#84cc16','#5c4033','#0ea5e9','#14b8a6'];

interface Props {
  visible: boolean;
  category?: Category | null;
  defaultParentId?: string | null;
  categories: Category[];
  onSave: (data: Omit<Category, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function CategoryModal({ visible, category, defaultParentId, categories, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color || COLORS[0]);
      setParentId(category.parentId);
    } else {
      setName('');
      setIcon('');
      setColor(COLORS[0]);
      setParentId(defaultParentId ?? null);
    }
  }, [category, defaultParentId, visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    const siblings = categories.filter(c => c.parentId === parentId);
    onSave({
      name: name.trim(), icon, color, parentId,
      sortOrder: category?.sortOrder ?? siblings.length,
    });
  };

  const topLevel = categories.filter(c => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);
  const validParents = category
    ? categories.filter(c => {
        const descendants = new Set<string>();
        const collect = (id: string) => {
          descendants.add(id);
          categories.filter(x => x.parentId === id).forEach(x => collect(x.id));
        };
        collect(category.id);
        return !descendants.has(c.id);
      })
    : categories;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>{category ? '编辑分类' : '新建分类'}</Text>

          <Text style={styles.label}>分类名称 *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="如：T恤、牛仔裤..."
            placeholderTextColor={C.textPlaceholder}
            autoFocus
          />

          <Text style={styles.label}>所属分类</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parentScroll}>
            <TouchableOpacity
              style={[styles.parentChip, parentId === null && styles.parentChipActive]}
              onPress={() => setParentId(null)}
            >
              <Text style={[styles.parentChipText, parentId === null && styles.parentChipTextActive]}>
                顶级
              </Text>
            </TouchableOpacity>
            {validParents.filter(c => !category || c.id !== category.id).map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.parentChip, parentId === c.id && styles.parentChipActive]}
                onPress={() => setParentId(c.id)}
              >
                <Text style={[styles.parentChipText, parentId === c.id && styles.parentChipTextActive]}>
                  {c.icon ? `${c.icon} ` : ''}{c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>图标</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <TouchableOpacity
              style={[styles.iconBtn, icon === '' && styles.iconBtnActive]}
              onPress={() => setIcon('')}
            >
              <Text style={styles.iconBtnText}>无</Text>
            </TouchableOpacity>
            {ICONS.map(ic => (
              <TouchableOpacity
                key={ic}
                style={[styles.iconBtn, icon === ic && styles.iconBtnActive]}
                onPress={() => setIcon(ic)}
              >
                <Text style={{ fontSize: 20 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>颜色标签</Text>
          <View style={styles.colorRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={styles.saveText}>{category ? '保存' : '创建'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    width: '100%', maxWidth: 380,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  title: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: C.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: C.borderLight, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15, color: C.textPrimary, marginBottom: 16,
  },
  parentScroll: { marginBottom: 16 },
  parentChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: C.borderLight, marginRight: 8,
    backgroundColor: C.bgMuted,
  },
  parentChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  parentChipText: { fontSize: 13, color: C.textSecondary },
  parentChipTextActive: { color: '#fff', fontWeight: '600' },
  iconBtn: {
    width: 40, height: 40, borderRadius: 10, borderWidth: 1,
    borderColor: C.borderLight, alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  iconBtnActive: { borderColor: C.textMuted, backgroundColor: C.bgMuted },
  iconBtnText: { fontSize: 12, color: C.textMuted },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  colorDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: C.textPrimary, transform: [{ scale: 1.15 }] },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: C.borderLight, alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: C.textSecondary },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
