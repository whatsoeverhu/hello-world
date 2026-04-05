import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, seedDefaultCategories } from '../db/database';
import type { Category, ClothingItem } from '../db/types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  categories: Category[];
  clothing: ClothingItem[];
  selectedCategoryId: string | null;
  sidebarOpen: boolean;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  loading: boolean;
}

interface AppActions {
  selectCategory: (id: string | null) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSearchQuery: (q: string) => void;
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addClothing: (item: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClothing: (id: string, data: Partial<ClothingItem>) => Promise<void>;
  deleteClothing: (id: string) => Promise<void>;
  reorderClothing: (categoryId: string, orderedIds: string[]) => Promise<void>;
  moveClothing: (itemId: string, targetCategoryId: string) => Promise<void>;
  getFilteredClothing: () => ClothingItem[];
  getCategoryById: (id: string) => Category | undefined;
  getAllBrands: () => string[];
  refreshData: () => Promise<void>;
}

type AppContextType = AppState & AppActions;

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const [cats, items] = await Promise.all([
      db.categories.orderBy('sortOrder').toArray(),
      db.clothing.orderBy('sortOrder').toArray(),
    ]);
    setCategories(cats);
    setClothing(items);
  }, []);

  useEffect(() => {
    (async () => {
      await seedDefaultCategories();
      await refreshData();
      setLoading(false);
    })();
  }, [refreshData]);

  const selectCategory = useCallback((id: string | null) => {
    setSelectedCategoryId(id);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const addCategory = useCallback(async (cat: Omit<Category, 'id' | 'createdAt'>) => {
    const newCat: Category = {
      ...cat,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    await db.categories.add(newCat);
    await refreshData();
  }, [refreshData]);

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    await db.categories.update(id, data);
    await refreshData();
  }, [refreshData]);

  const deleteCategory = useCallback(async (id: string) => {
    // Get all descendant category IDs
    const allCats = await db.categories.toArray();
    const toDelete = new Set<string>();
    const collectDescendants = (parentId: string) => {
      toDelete.add(parentId);
      allCats.filter(c => c.parentId === parentId).forEach(c => collectDescendants(c.id));
    };
    collectDescendants(id);
    // Delete clothing in those categories
    await db.clothing.where('categoryId').anyOf([...toDelete]).delete();
    await db.categories.where('id').anyOf([...toDelete]).delete();
    if (selectedCategoryId && toDelete.has(selectedCategoryId)) {
      setSelectedCategoryId(null);
    }
    await refreshData();
  }, [refreshData, selectedCategoryId]);

  const addClothing = useCallback(async (item: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem: ClothingItem = {
      ...item,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await db.clothing.add(newItem);
    await refreshData();
  }, [refreshData]);

  const updateClothing = useCallback(async (id: string, data: Partial<ClothingItem>) => {
    await db.clothing.update(id, { ...data, updatedAt: new Date().toISOString() });
    await refreshData();
  }, [refreshData]);

  const deleteClothing = useCallback(async (id: string) => {
    await db.clothing.delete(id);
    await refreshData();
  }, [refreshData]);

  const reorderClothing = useCallback(async (_categoryId: string, orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) =>
      db.clothing.update(id, { sortOrder: index })
    );
    await Promise.all(updates);
    await refreshData();
  }, [refreshData]);

  const moveClothing = useCallback(async (itemId: string, targetCategoryId: string) => {
    const targetItems = clothing.filter(c => c.categoryId === targetCategoryId);
    await db.clothing.update(itemId, {
      categoryId: targetCategoryId,
      sortOrder: targetItems.length,
      updatedAt: new Date().toISOString(),
    });
    await refreshData();
  }, [refreshData, clothing]);

  const getFilteredClothing = useCallback(() => {
    let items = clothing;
    if (selectedCategoryId) {
      items = items.filter(c => c.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(c =>
        c.brand.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    }
    return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [clothing, selectedCategoryId, searchQuery]);

  const getCategoryById = useCallback((id: string) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  const getAllBrands = useCallback(() => {
    const brands = new Set(clothing.map(c => c.brand).filter(Boolean));
    return [...brands].sort();
  }, [clothing]);

  const value: AppContextType = {
    categories, clothing, selectedCategoryId, sidebarOpen, viewMode,
    searchQuery, loading,
    selectCategory, toggleSidebar, setViewMode, setSearchQuery,
    addCategory, updateCategory, deleteCategory,
    addClothing, updateClothing, deleteClothing,
    reorderClothing, moveClothing,
    getFilteredClothing, getCategoryById, getAllBrands, refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
