import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as DB from '../db/database';
import type { Category, ClothingItem } from '../db/types';

interface AppState {
  categories: Category[];
  clothing: ClothingItem[];
  selectedCategoryId: string | null;
  viewMode: 'grid' | 'list';
  searchQuery: string;
}

interface AppActions {
  selectCategory: (id: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSearchQuery: (q: string) => void;
  addCategory: (data: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addClothing: (data: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClothing: (id: string, data: Partial<ClothingItem>) => void;
  deleteClothing: (id: string) => void;
  reorderClothing: (categoryId: string, orderedIds: string[]) => void;
  moveClothing: (itemId: string, targetCategoryId: string) => void;
  getFilteredClothing: () => ClothingItem[];
  getCategoryById: (id: string) => Category | undefined;
  getAllBrands: () => string[];
  refresh: () => void;
}

type AppContextType = AppState & AppActions;

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(() => {
    setCategories(DB.getCategories());
    setClothing(DB.getClothing());
  }, []);

  useEffect(() => {
    DB.initDb();
    refresh();
  }, [refresh]);

  const addCategory = useCallback((data: Omit<Category, 'id' | 'createdAt'>) => {
    const cat: Category = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    DB.insertCategory(cat);
    refresh();
  }, [refresh]);

  const updateCategory = useCallback((id: string, data: Partial<Category>) => {
    DB.updateCategory(id, data);
    refresh();
  }, [refresh]);

  const deleteCategory = useCallback((id: string) => {
    DB.deleteCategory(id);
    if (selectedCategoryId === id) setSelectedCategoryId(null);
    refresh();
  }, [refresh, selectedCategoryId]);

  const addClothing = useCallback((data: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const item: ClothingItem = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    DB.insertClothing(item);
    refresh();
  }, [refresh]);

  const updateClothing = useCallback((id: string, data: Partial<ClothingItem>) => {
    DB.updateClothing(id, data);
    refresh();
  }, [refresh]);

  const deleteClothing = useCallback((id: string) => {
    DB.deleteClothing(id);
    refresh();
  }, [refresh]);

  const reorderClothing = useCallback((_categoryId: string, orderedIds: string[]) => {
    DB.reorderClothing(orderedIds);
    refresh();
  }, [refresh]);

  const moveClothing = useCallback((itemId: string, targetCategoryId: string) => {
    const targetCount = clothing.filter(c => c.categoryId === targetCategoryId).length;
    DB.updateClothing(itemId, { categoryId: targetCategoryId, sortOrder: targetCount });
    refresh();
  }, [refresh, clothing]);

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

  const getCategoryById = useCallback((id: string) =>
    categories.find(c => c.id === id), [categories]);

  const getAllBrands = useCallback(() =>
    [...new Set(clothing.map(c => c.brand).filter(Boolean))].sort(), [clothing]);

  return (
    <AppContext.Provider value={{
      categories, clothing, selectedCategoryId, viewMode, searchQuery,
      selectCategory: setSelectedCategoryId, setViewMode, setSearchQuery,
      addCategory, updateCategory, deleteCategory,
      addClothing, updateClothing, deleteClothing,
      reorderClothing, moveClothing,
      getFilteredClothing, getCategoryById, getAllBrands, refresh,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
