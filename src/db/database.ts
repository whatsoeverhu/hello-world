import Dexie, { type Table } from 'dexie';
import type { Category, ClothingItem, BrandLogo } from './types';

class WardrobeDatabase extends Dexie {
  categories!: Table<Category, string>;
  clothing!: Table<ClothingItem, string>;
  brandLogos!: Table<BrandLogo, number>;

  constructor() {
    super('WardrobeDB');
    this.version(1).stores({
      categories: 'id, parentId, sortOrder, createdAt',
      clothing: 'id, categoryId, brand, sortOrder, createdAt',
      brandLogos: '++id, brand',
    });
  }
}

export const db = new WardrobeDatabase();

// Seed default categories
export async function seedDefaultCategories() {
  const count = await db.categories.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  const defaults: Category[] = [
    { id: 'top', name: '上装', parentId: null, icon: '👔', color: '#8b5cf6', sortOrder: 0, createdAt: now },
    { id: 'top-shirt', name: '衬衫', parentId: 'top', icon: '', color: '', sortOrder: 0, createdAt: now },
    { id: 'top-tshirt', name: 'T恤', parentId: 'top', icon: '', color: '', sortOrder: 1, createdAt: now },
    { id: 'top-hoodie', name: '卫衣', parentId: 'top', icon: '', color: '', sortOrder: 2, createdAt: now },
    { id: 'top-jacket', name: '外套', parentId: 'top', icon: '', color: '', sortOrder: 3, createdAt: now },
    { id: 'bottom', name: '下装', parentId: null, icon: '👖', color: '#3b82f6', sortOrder: 1, createdAt: now },
    { id: 'bottom-jeans', name: '牛仔裤', parentId: 'bottom', icon: '', color: '', sortOrder: 0, createdAt: now },
    { id: 'bottom-pants', name: '休闲裤', parentId: 'bottom', icon: '', color: '', sortOrder: 1, createdAt: now },
    { id: 'bottom-shorts', name: '短裤', parentId: 'bottom', icon: '', color: '', sortOrder: 2, createdAt: now },
    { id: 'shoes', name: '鞋履', parentId: null, icon: '👟', color: '#f59e0b', sortOrder: 2, createdAt: now },
    { id: 'bag', name: '箱包', parentId: null, icon: '👜', color: '#10b981', sortOrder: 3, createdAt: now },
    { id: 'bag-backpack', name: '双肩包', parentId: 'bag', icon: '', color: '', sortOrder: 0, createdAt: now },
    { id: 'bag-tote', name: '手提包', parentId: 'bag', icon: '', color: '', sortOrder: 1, createdAt: now },
    { id: 'accessories', name: '配饰', parentId: null, icon: '⌚', color: '#ec4899', sortOrder: 4, createdAt: now },
  ];

  await db.categories.bulkAdd(defaults);
}
