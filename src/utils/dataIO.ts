import { db } from '../db/database';
import type { Category, ClothingItem, BrandLogo } from '../db/types';

interface ExportData {
  version: number;
  exportedAt: string;
  categories: Category[];
  clothing: ClothingItem[];
  brandLogos: BrandLogo[];
}

export async function exportData(): Promise<void> {
  const [categories, clothing, brandLogos] = await Promise.all([
    db.categories.toArray(),
    db.clothing.toArray(),
    db.brandLogos.toArray(),
  ]);

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    clothing,
    brandLogos,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wardrobe-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const data: ExportData = JSON.parse(text);

    if (!data.version || !data.categories || !data.clothing) {
      return { success: false, message: '文件格式不正确' };
    }

    // Clear existing data
    await Promise.all([
      db.categories.clear(),
      db.clothing.clear(),
      db.brandLogos.clear(),
    ]);

    // Import
    if (data.categories.length > 0) await db.categories.bulkAdd(data.categories);
    if (data.clothing.length > 0) await db.clothing.bulkAdd(data.clothing);
    if (data.brandLogos?.length > 0) {
      // Remove id to let auto-increment work
      const logos = data.brandLogos.map(({ id: _id, ...rest }) => rest);
      await db.brandLogos.bulkAdd(logos as BrandLogo[]);
    }

    return {
      success: true,
      message: `成功导入 ${data.categories.length} 个分类，${data.clothing.length} 件衣物`,
    };
  } catch (err) {
    return { success: false, message: `导入失败：${err instanceof Error ? err.message : '未知错误'}` };
  }
}
