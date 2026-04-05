import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { Category } from '../../db/types';

interface Props {
  itemId: string;
  onClose: () => void;
}

export function MoveItemModal({ itemId, onClose }: Props) {
  const { categories, moveClothing, clothing } = useApp();
  const item = clothing.find(c => c.id === itemId);
  const [selectedCatId, setSelectedCatId] = useState(item?.categoryId ?? '');

  const handleMove = async () => {
    if (selectedCatId && selectedCatId !== item?.categoryId) {
      await moveClothing(itemId, selectedCatId);
    }
    onClose();
  };

  const renderOption = (cat: Category, depth = 0): React.ReactNode => {
    const prefix = '\u00a0'.repeat(depth * 3);
    const children = categories.filter(c => c.parentId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder);
    return (
      <>
        <option key={cat.id} value={cat.id}>{prefix}{cat.icon && `${cat.icon} `}{cat.name}</option>
        {children.map(child => renderOption(child, depth + 1))}
      </>
    );
  };

  const topLevel = categories.filter(c => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="font-semibold text-[#3d3423] mb-4">移动到分类</h3>
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#9d8860] mb-1.5">目标分类</label>
          <select
            value={selectedCatId}
            onChange={e => setSelectedCatId(e.target.value)}
            className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] bg-white"
          >
            {topLevel.map(cat => renderOption(cat))}
          </select>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#7d6b49] hover:bg-[#f5f0e8] rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleMove}
            disabled={!selectedCatId || selectedCatId === item?.categoryId}
            className="px-4 py-2 text-sm bg-[#4a6741] text-white hover:bg-[#3d5636] rounded-lg transition-colors disabled:opacity-50"
          >
            移动
          </button>
        </div>
      </div>
    </div>
  );
}
