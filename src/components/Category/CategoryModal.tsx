import React, { useState, useEffect } from 'react';
import type { Category } from '../../db/types';

interface Props {
  category: Category | null;
  defaultParentId: string | null;
  categories: Category[];
  icons: string[];
  colors: string[];
  onSave: (data: { name: string; icon: string; color: string; parentId: string | null }) => void;
  onClose: () => void;
}

export function CategoryModal({ category, defaultParentId, categories, icons, colors, onSave, onClose }: Props) {
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? '');
  const [color, setColor] = useState(category?.color ?? colors[0]);
  const [parentId, setParentId] = useState<string | null>(
    category?.parentId !== undefined ? category.parentId : defaultParentId
  );

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon ?? '');
      setColor(category.color ?? colors[0]);
      setParentId(category.parentId);
    }
  }, [category, colors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color, parentId });
  };

  // Build parent options (flat list, excluding current category and its descendants)
  const getValidParents = () => {
    if (!category) return categories;
    const descendants = new Set<string>();
    const collect = (id: string) => {
      descendants.add(id);
      categories.filter(c => c.parentId === id).forEach(c => collect(c.id));
    };
    collect(category.id);
    return categories.filter(c => !descendants.has(c.id));
  };

  const validParents = getValidParents();
  const topLevel = validParents.filter(c => c.parentId === null);

  const renderOption = (cat: Category, depth = 0): React.ReactNode => {
    const prefix = '\u00a0'.repeat(depth * 3);
    const children = validParents.filter(c => c.parentId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder);
    return (
      <React.Fragment key={cat.id}>
        <option value={cat.id}>{prefix}{cat.icon && `${cat.icon} `}{cat.name}</option>
        {children.map(child => renderOption(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="font-semibold text-[#3d3423] mb-4">
          {category ? '编辑分类' : '新建分类'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[#9d8860] mb-1.5">分类名称 *</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="如：T恤、牛仔裤..."
              className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] focus:ring-1 focus:ring-[#9d8860]"
            />
          </div>

          {/* Parent */}
          <div>
            <label className="block text-xs font-medium text-[#9d8860] mb-1.5">所属分类</label>
            <select
              value={parentId ?? ''}
              onChange={e => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] bg-white"
            >
              <option value="">（顶级分类）</option>
              {topLevel.map(cat => renderOption(cat))}
            </select>
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-medium text-[#9d8860] mb-1.5">图标</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setIcon('')}
                className={`w-8 h-8 text-xs rounded-lg border transition-all ${icon === '' ? 'border-[#9d8860] bg-[#f5f0e8]' : 'border-[#ede4d3] hover:border-[#c9b898]'}`}
              >
                无
              </button>
              {icons.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-8 h-8 text-lg rounded-lg border transition-all ${icon === ic ? 'border-[#9d8860] bg-[#f5f0e8] scale-110' : 'border-[#ede4d3] hover:border-[#c9b898]'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-[#9d8860] mb-1.5">颜色标签</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-[#3d3423] scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-[#7d6b49] hover:bg-[#f5f0e8] rounded-lg transition-colors border border-[#ede4d3]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 text-sm bg-[#4a6741] text-white hover:bg-[#3d5636] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {category ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
