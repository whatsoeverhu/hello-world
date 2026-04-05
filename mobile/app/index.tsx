import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, TextInput, Alert, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useApp } from '../store/AppContext';
import { ClothingCard } from '../components/Clothing/ClothingCard';
import { ClothingListRow } from '../components/Clothing/ClothingListRow';
import { EmptyState } from '../components/Common/EmptyState';
import { CategoryModal } from '../components/Category/CategoryModal';
import type { Category, ClothingItem } from '../db/types';
import { C } from '../utils/colors';

export default function WardrobeScreen() {
  const router = useRouter();
  const {
    categories, selectedCategoryId, selectCategory,
    viewMode, setViewMode, searchQuery, setSearchQuery,
    getFilteredClothing, reorderClothing, deleteClothing,
    getCategoryById, clothing, deleteCategory, addCategory, updateCategory,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(categories.filter(c => c.parentId === null).map(c => c.id))
  );

  const items = getFilteredClothing();
  const selectedCat = selectedCategoryId ? getCategoryById(selectedCategoryId) : null;

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeleteClothing = (id: string) => {
    Alert.alert('删除衣物', '确认删除这件衣物？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteClothing(id) },
    ]);
  };

  const handleDeleteCategory = (cat: Category) => {
    Alert.alert('删除分类', `确认删除「${cat.name}」及其所有子分类和衣物？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deleteCategory(cat.id) },
    ]);
  };

  const renderCategoryItem = (cat: Category, depth = 0): React.ReactNode => {
    const children = categories.filter(c => c.parentId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder);
    const isExpanded = expandedIds.has(cat.id);
    const isSelected = selectedCategoryId === cat.id;
    const count = clothing.filter(c => c.categoryId === cat.id).length;

    return (
      <View key={cat.id}>
        <TouchableOpacity
          style={[styles.catItem, { paddingLeft: 12 + depth * 14 }, isSelected && styles.catItemSelected]}
          onPress={() => selectCategory(cat.id)}
          onLongPress={() => {
            Alert.alert(cat.name, '', [
              { text: '编辑', onPress: () => { setEditingCat(cat); setCatModalVisible(true); } },
              { text: '添加子分类', onPress: () => { setDefaultParentId(cat.id); setEditingCat(null); setCatModalVisible(true); toggleExpand(cat.id); } },
              { text: '删除', style: 'destructive', onPress: () => handleDeleteCategory(cat) },
              { text: '取消', style: 'cancel' },
            ]);
          }}
          activeOpacity={0.7}
        >
          {children.length > 0 ? (
            <TouchableOpacity onPress={() => toggleExpand(cat.id)} style={styles.expandBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.expandArrow, isExpanded && styles.expandArrowOpen]}>›</Text>
            </TouchableOpacity>
          ) : <View style={styles.expandBtn} />}

          {cat.icon ? (
            <Text style={styles.catIcon}>{cat.icon}</Text>
          ) : (
            <View style={[styles.catDot, { backgroundColor: cat.color || C.textMuted }]} />
          )}

          <Text style={[styles.catName, isSelected && styles.catNameSelected]} numberOfLines={1}>
            {cat.name}
          </Text>

          {count > 0 && (
            <View style={[styles.catBadge, isSelected && styles.catBadgeSelected]}>
              <Text style={[styles.catBadgeText, isSelected && styles.catBadgeTextSelected]}>{count}</Text>
            </View>
          )}
        </TouchableOpacity>

        {isExpanded && children.map(child => renderCategoryItem(child, depth + 1))}
      </View>
    );
  };

  const topLevel = categories.filter(c => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);

  const renderClothingCard = ({ item, drag, isActive }: RenderItemParams<ClothingItem>) => (
    <View style={[styles.cardWrap, isActive && { opacity: 0.5 }]}>
      <ClothingCard
        item={item}
        onPress={() => router.push({ pathname: '/clothing-detail', params: { id: item.id } })}
        onLongPress={drag}
      />
    </View>
  );

  const renderListRow = ({ item, drag, isActive }: RenderItemParams<ClothingItem>) => (
    <View style={isActive ? { opacity: 0.5 } : {}}>
      <ClothingListRow
        item={item}
        onPress={() => router.push({ pathname: '/clothing-detail', params: { id: item.id } })}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(p => !p)} style={styles.iconBtn}>
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.appTitle}>🪞 电子衣柜</Text>

        <View style={styles.headerRight}>
          {/* View toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'grid' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('grid')}
            >
              <Text style={styles.viewToggleIcon}>⊞</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={styles.viewToggleIcon}>☰</Text>
            </TouchableOpacity>
          </View>

          {/* Add button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/add-clothing')}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ 添加</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="搜索品牌、备注..."
          placeholderTextColor={C.textPlaceholder}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.body}>
        {/* Sidebar */}
        {sidebarOpen && (
          <View style={styles.sidebar}>
            {/* All items */}
            <TouchableOpacity
              style={[styles.catItem, selectedCategoryId === null && styles.catItemSelected]}
              onPress={() => selectCategory(null)}
            >
              <View style={styles.expandBtn} />
              <Text style={styles.catIcon}>🗂️</Text>
              <Text style={[styles.catName, selectedCategoryId === null && styles.catNameSelected]}>全部</Text>
              <View style={[styles.catBadge, selectedCategoryId === null && styles.catBadgeSelected]}>
                <Text style={[styles.catBadgeText, selectedCategoryId === null && styles.catBadgeTextSelected]}>
                  {clothing.length}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <FlatList
              data={topLevel}
              keyExtractor={c => c.id}
              renderItem={({ item }) => <>{renderCategoryItem(item)}</>}
              showsVerticalScrollIndicator={false}
              style={styles.catList}
            />

            {/* Add category */}
            <TouchableOpacity
              style={styles.addCatBtn}
              onPress={() => { setEditingCat(null); setDefaultParentId(null); setCatModalVisible(true); }}
            >
              <Text style={styles.addCatText}>+ 新建分类</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main content */}
        <View style={styles.main}>
          {selectedCat && (
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>
                {selectedCat.icon ? `${selectedCat.icon} ` : ''}{selectedCat.name}
              </Text>
            </View>
          )}

          {items.length === 0 ? (
            <EmptyState
              onAdd={() => router.push('/add-clothing')}
              categoryName={selectedCat?.name}
            />
          ) : viewMode === 'grid' ? (
            <DraggableFlatList
              data={items}
              keyExtractor={i => i.id}
              renderItem={renderClothingCard}
              onDragEnd={({ data }) => reorderClothing(selectedCategoryId ?? '', data.map(i => i.id))}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <DraggableFlatList
              data={items}
              keyExtractor={i => i.id}
              renderItem={renderListRow}
              onDragEnd={({ data }) => reorderClothing(selectedCategoryId ?? '', data.map(i => i.id))}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* Category modal */}
      <CategoryModal
        visible={catModalVisible}
        category={editingCat}
        defaultParentId={defaultParentId}
        categories={categories}
        onSave={data => {
          if (editingCat) {
            updateCategory(editingCat.id, data);
          } else {
            addCategory(data);
          }
          setCatModalVisible(false);
        }}
        onClose={() => setCatModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 10, backgroundColor: C.bgCard,
    borderBottomWidth: 1, borderBottomColor: C.borderLight, gap: 8,
  },
  iconBtn: { padding: 6 },
  headerIcon: { fontSize: 18, color: C.textSecondary },
  appTitle: { fontSize: 16, fontWeight: '700', color: C.brown },
  headerRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  viewToggle: { flexDirection: 'row', backgroundColor: C.bgMuted, borderRadius: 8, padding: 2 },
  viewToggleBtn: { padding: 5, borderRadius: 6 },
  viewToggleBtnActive: { backgroundColor: C.bgCard },
  viewToggleIcon: { fontSize: 14, color: C.textSecondary },
  addBtn: { backgroundColor: C.accent, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  // Search
  searchWrap: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.borderLight },
  searchInput: {
    backgroundColor: C.bgMuted, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 14, color: C.textPrimary,
  },

  // Body
  body: { flex: 1, flexDirection: 'row' },

  // Sidebar
  sidebar: {
    width: 140, backgroundColor: C.bgCard,
    borderRightWidth: 1, borderRightColor: C.borderLight,
    paddingTop: 6,
  },
  catList: { flex: 1 },
  divider: { height: 1, backgroundColor: C.borderLight, marginVertical: 6, marginHorizontal: 8 },
  catItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingRight: 8, paddingLeft: 12,
    borderRadius: 8, marginHorizontal: 4, marginBottom: 1, gap: 5,
  },
  catItemSelected: { backgroundColor: C.accent },
  expandBtn: { width: 14, alignItems: 'center' },
  expandArrow: { fontSize: 14, color: C.textPlaceholder, lineHeight: 14 },
  expandArrowOpen: { transform: [{ rotate: '90deg' }] },
  catIcon: { fontSize: 14 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { flex: 1, fontSize: 13, color: C.textPrimary, fontWeight: '500' },
  catNameSelected: { color: '#fff', fontWeight: '600' },
  catBadge: {
    backgroundColor: C.bgStrong, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
  },
  catBadgeSelected: { backgroundColor: 'rgba(255,255,255,0.25)' },
  catBadgeText: { fontSize: 10, color: C.textMuted, fontWeight: '600' },
  catBadgeTextSelected: { color: '#fff' },
  addCatBtn: {
    padding: 12, borderTopWidth: 1, borderTopColor: C.borderLight,
    alignItems: 'center',
  },
  addCatText: { fontSize: 12, color: C.textMuted, fontWeight: '600' },

  // Main
  main: { flex: 1 },
  breadcrumb: { paddingHorizontal: 12, paddingVertical: 8 },
  breadcrumbText: { fontSize: 13, fontWeight: '600', color: C.textSecondary },

  // Grid
  gridContent: { padding: 10 },
  gridRow: { justifyContent: 'space-between', marginBottom: 10 },
  cardWrap: {},

  // List
  listContent: { padding: 10 },
});
