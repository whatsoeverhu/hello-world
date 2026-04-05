import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { Category } from '../../db/types';
import { CategoryModal } from './CategoryModal';

const CATEGORY_ICONS = ['👔', '👕', '👗', '👖', '🧥', '🥼', '🧣', '🧤', '👟', '👠', '👜', '🎒', '⌚', '💍', '🕶️', '🧢', '📦'];
const CATEGORY_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#5c4033', '#0ea5e9'];

interface CategoryItemProps {
  category: Category;
  depth: number;
  allCategories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onAddChild: (parentId: string) => void;
  clothingCount: (id: string) => number;
}

function CategoryItem({
  category, depth, allCategories, selectedId, onSelect,
  expandedIds, onToggleExpand, onEdit, onDelete, onAddChild, clothingCount
}: CategoryItemProps) {
  const [showActions, setShowActions] = useState(false);
  const children = allCategories.filter(c => c.parentId === category.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const isExpanded = expandedIds.has(category.id);
  const isSelected = selectedId === category.id;
  const count = clothingCount(category.id);

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm relative
          ${isSelected
            ? 'bg-[#4a6741] text-white'
            : 'hover:bg-[#f5f0e8] text-[#5c4033]'
          }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect(category.id)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Expand toggle */}
        {children.length > 0 ? (
          <button
            onClick={e => { e.stopPropagation(); onToggleExpand(category.id); }}
            className={`w-4 h-4 flex items-center justify-center flex-shrink-0 rounded transition-transform
              ${isSelected ? 'text-white/80 hover:text-white' : 'text-[#c9b898] hover:text-[#7d6b49]'}`}
          >
            <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Icon or color dot */}
        {category.icon ? (
          <span className="text-base leading-none flex-shrink-0">{category.icon}</span>
        ) : (
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color || '#c9b898' }}
          />
        )}

        <span className="flex-1 truncate font-medium">{category.name}</span>

        {/* Count badge */}
        {count > 0 && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0
            ${isSelected ? 'bg-white/20 text-white' : 'bg-[#ede4d3] text-[#9d8860]'}`}>
            {count}
          </span>
        )}

        {/* Action buttons */}
        {showActions && !isSelected && (
          <div className="absolute right-1 flex items-center gap-0.5 bg-[#f5f0e8] rounded-md p-0.5">
            <button
              onClick={e => { e.stopPropagation(); onAddChild(category.id); }}
              className="p-1 hover:bg-[#ede4d3] rounded text-[#9d8860] hover:text-[#5c4033]"
              title="添加子分类"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={e => { e.stopPropagation(); onEdit(category); }}
              className="p-1 hover:bg-[#ede4d3] rounded text-[#9d8860] hover:text-[#5c4033]"
              title="编辑分类"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(category); }}
              className="p-1 hover:bg-red-50 rounded text-[#9d8860] hover:text-red-500"
              title="删除分类"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
        {showActions && isSelected && (
          <div className="absolute right-1 flex items-center gap-0.5 bg-[#3d5636] rounded-md p-0.5">
            <button
              onClick={e => { e.stopPropagation(); onAddChild(category.id); }}
              className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
              title="添加子分类"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={e => { e.stopPropagation(); onEdit(category); }}
              className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
              title="编辑分类"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && children.length > 0 && (
        <div>
          {children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              allCategories={allCategories}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              clothingCount={clothingCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree() {
  const { categories, selectedCategoryId, selectCategory, clothing, deleteCategory, addCategory, updateCategory } = useApp();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand top-level categories
    const tops = categories.filter(c => c.parentId === null).map(c => c.id);
    return new Set(tops);
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clothingCount = (id: string) => clothing.filter(c => c.categoryId === id).length;

  const topLevel = categories.filter(c => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddChild = (parentId: string) => {
    setDefaultParentId(parentId);
    setEditingCat(null);
    setModalOpen(true);
    // Auto-expand parent
    setExpandedIds(prev => new Set([...prev, parentId]));
  };

  const handleEdit = (cat: Category) => {
    setEditingCat(cat);
    setDefaultParentId(null);
    setModalOpen(true);
  };

  const handleDelete = (cat: Category) => {
    setDeleteConfirm(cat);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteCategory(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleSave = async (data: { name: string; icon: string; color: string; parentId: string | null }) => {
    if (editingCat) {
      await updateCategory(editingCat.id, { name: data.name, icon: data.icon, color: data.color, parentId: data.parentId });
    } else {
      const siblings = categories.filter(c => c.parentId === data.parentId);
      await addCategory({
        name: data.name,
        parentId: data.parentId,
        icon: data.icon,
        color: data.color,
        sortOrder: siblings.length,
      });
    }
    setModalOpen(false);
    setEditingCat(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* "All items" option */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium mx-2 mb-1
          ${selectedCategoryId === null ? 'bg-[#4a6741] text-white' : 'hover:bg-[#f5f0e8] text-[#5c4033]'}`}
        onClick={() => selectCategory(null)}
      >
        <span className="text-base">🗂️</span>
        <span className="flex-1">全部衣物</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategoryId === null ? 'bg-white/20 text-white' : 'bg-[#ede4d3] text-[#9d8860]'}`}>
          {clothing.length}
        </span>
      </div>

      <div className="h-px bg-[#ede4d3] mx-2 mb-2" />

      {/* Category tree */}
      <div className="flex-1 overflow-y-auto px-1 space-y-0.5">
        {topLevel.map(cat => (
          <CategoryItem
            key={cat.id}
            category={cat}
            depth={0}
            allCategories={categories}
            selectedId={selectedCategoryId}
            onSelect={selectCategory}
            expandedIds={expandedIds}
            onToggleExpand={toggleExpand}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            clothingCount={clothingCount}
          />
        ))}
      </div>

      {/* Add category button */}
      <div className="p-2 border-t border-[#ede4d3]">
        <button
          onClick={() => { setEditingCat(null); setDefaultParentId(null); setModalOpen(true); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#9d8860] hover:text-[#5c4033] hover:bg-[#f5f0e8] rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建分类
        </button>
      </div>

      {/* Category modal */}
      {modalOpen && (
        <CategoryModal
          category={editingCat}
          defaultParentId={defaultParentId}
          categories={categories}
          icons={CATEGORY_ICONS}
          colors={CATEGORY_COLORS}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingCat(null); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-[#3d3423] mb-2">删除分类</h3>
            <p className="text-sm text-[#7d6b49] mb-4">
              确认删除「{deleteConfirm.name}」及其所有子分类和衣物？此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-[#7d6b49] hover:bg-[#f5f0e8] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
