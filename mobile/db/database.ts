import * as SQLite from 'expo-sqlite';
import type { Category, ClothingItem } from './types';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('wardrobe.db');
  }
  return _db;
}

export function initDb() {
  const db = getDb();

  db.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parentId TEXT,
      icon TEXT DEFAULT '',
      color TEXT DEFAULT '',
      sortOrder INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clothing (
      id TEXT PRIMARY KEY,
      categoryId TEXT NOT NULL,
      images TEXT NOT NULL DEFAULT '[]',
      coverIndex INTEGER DEFAULT 0,
      brand TEXT NOT NULL,
      tempMin REAL,
      tempMax REAL,
      price REAL,
      purchaseDate TEXT,
      purchaseUrl TEXT,
      notes TEXT,
      sortOrder INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Seed defaults if empty
  const count = db.getFirstSync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM categories');
  if (!count || count.cnt === 0) {
    seedDefaults(db);
  }
}

function seedDefaults(db: SQLite.SQLiteDatabase) {
  const now = new Date().toISOString();
  const defaults: Category[] = [
    { id: 'top', name: '上装', parentId: null, icon: '👔', color: '#8b5cf6', sortOrder: 0, createdAt: now },
    { id: 'top-shirt', name: '衬衫', parentId: 'top', icon: '', color: '#8b5cf6', sortOrder: 0, createdAt: now },
    { id: 'top-tshirt', name: 'T恤', parentId: 'top', icon: '', color: '#8b5cf6', sortOrder: 1, createdAt: now },
    { id: 'top-hoodie', name: '卫衣', parentId: 'top', icon: '', color: '#8b5cf6', sortOrder: 2, createdAt: now },
    { id: 'top-jacket', name: '外套', parentId: 'top', icon: '', color: '#8b5cf6', sortOrder: 3, createdAt: now },
    { id: 'bottom', name: '下装', parentId: null, icon: '👖', color: '#3b82f6', sortOrder: 1, createdAt: now },
    { id: 'bottom-jeans', name: '牛仔裤', parentId: 'bottom', icon: '', color: '#3b82f6', sortOrder: 0, createdAt: now },
    { id: 'bottom-pants', name: '休闲裤', parentId: 'bottom', icon: '', color: '#3b82f6', sortOrder: 1, createdAt: now },
    { id: 'bottom-shorts', name: '短裤', parentId: 'bottom', icon: '', color: '#3b82f6', sortOrder: 2, createdAt: now },
    { id: 'shoes', name: '鞋履', parentId: null, icon: '👟', color: '#f59e0b', sortOrder: 2, createdAt: now },
    { id: 'bag', name: '箱包', parentId: null, icon: '👜', color: '#10b981', sortOrder: 3, createdAt: now },
    { id: 'bag-backpack', name: '双肩包', parentId: 'bag', icon: '', color: '#10b981', sortOrder: 0, createdAt: now },
    { id: 'bag-tote', name: '手提包', parentId: 'bag', icon: '', color: '#10b981', sortOrder: 1, createdAt: now },
    { id: 'accessories', name: '配饰', parentId: null, icon: '⌚', color: '#ec4899', sortOrder: 4, createdAt: now },
  ];

  for (const cat of defaults) {
    db.runSync(
      'INSERT INTO categories (id, name, parentId, icon, color, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cat.id, cat.name, cat.parentId, cat.icon, cat.color, cat.sortOrder, cat.createdAt]
    );
  }
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export function getCategories(): Category[] {
  const db = getDb();
  const rows = db.getAllSync<Category>('SELECT * FROM categories ORDER BY sortOrder ASC');
  return rows;
}

export function insertCategory(cat: Category) {
  const db = getDb();
  db.runSync(
    'INSERT INTO categories (id, name, parentId, icon, color, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [cat.id, cat.name, cat.parentId, cat.icon, cat.color, cat.sortOrder, cat.createdAt]
  );
}

export function updateCategory(id: string, data: Partial<Category>) {
  const db = getDb();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  db.runSync(`UPDATE categories SET ${fields} WHERE id = ?`, values);
}

export function deleteCategory(id: string) {
  const db = getDb();
  // Collect descendants
  const all = getCategories();
  const toDelete: string[] = [];
  const collect = (parentId: string) => {
    toDelete.push(parentId);
    all.filter(c => c.parentId === parentId).forEach(c => collect(c.id));
  };
  collect(id);
  const placeholders = toDelete.map(() => '?').join(',');
  db.runSync(`DELETE FROM clothing WHERE categoryId IN (${placeholders})`, toDelete);
  db.runSync(`DELETE FROM categories WHERE id IN (${placeholders})`, toDelete);
}

// ─── Clothing CRUD ────────────────────────────────────────────────────────────

function rowToClothing(row: any): ClothingItem {
  return {
    ...row,
    images: JSON.parse(row.images || '[]'),
    tempMin: row.tempMin ?? undefined,
    tempMax: row.tempMax ?? undefined,
    price: row.price ?? undefined,
    purchaseDate: row.purchaseDate ?? undefined,
    purchaseUrl: row.purchaseUrl ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function getClothing(): ClothingItem[] {
  const db = getDb();
  const rows = db.getAllSync('SELECT * FROM clothing ORDER BY sortOrder ASC');
  return rows.map(rowToClothing);
}

export function insertClothing(item: ClothingItem) {
  const db = getDb();
  db.runSync(
    `INSERT INTO clothing (id, categoryId, images, coverIndex, brand, tempMin, tempMax, price, purchaseDate, purchaseUrl, notes, sortOrder, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id, item.categoryId, JSON.stringify(item.images), item.coverIndex,
      item.brand, item.tempMin ?? null, item.tempMax ?? null, item.price ?? null,
      item.purchaseDate ?? null, item.purchaseUrl ?? null, item.notes ?? null,
      item.sortOrder, item.createdAt, item.updatedAt,
    ]
  );
}

export function updateClothing(id: string, data: Partial<ClothingItem>) {
  const db = getDb();
  const payload: Record<string, string | number | null> = { updatedAt: new Date().toISOString() };
  for (const [k, v] of Object.entries(data)) {
    if (k === 'images') payload[k] = JSON.stringify(v);
    else if (v === undefined) payload[k] = null;
    else payload[k] = v as string | number | null;
  }
  const fields = Object.keys(payload).map(k => `${k} = ?`).join(', ');
  const values: (string | number | null)[] = [...Object.values(payload), id];
  db.runSync(`UPDATE clothing SET ${fields} WHERE id = ?`, values);
}

export function deleteClothing(id: string) {
  getDb().runSync('DELETE FROM clothing WHERE id = ?', [id]);
}

export function reorderClothing(orderedIds: string[]) {
  const db = getDb();
  orderedIds.forEach((id, index) => {
    db.runSync('UPDATE clothing SET sortOrder = ? WHERE id = ?', [index, id]);
  });
}
