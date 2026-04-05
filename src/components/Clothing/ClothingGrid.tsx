import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { ClothingItem } from '../../db/types';
import { useApp } from '../../store/AppContext';
import { ClothingCard } from './ClothingCard';
import { ClothingListItem } from './ClothingListItem';
import { EmptyState } from './EmptyState';
import { MoveItemModal } from './MoveItemModal';

interface Props {
  onAddClothing: () => void;
  onEditClothing: (item: ClothingItem) => void;
}

export function ClothingGrid({ onAddClothing, onEditClothing }: Props) {
  const { viewMode, getFilteredClothing, reorderClothing, deleteClothing, selectedCategoryId, getCategoryById, searchQuery } = useApp();
  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const items = getFilteredClothing();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    const categoryId = items[oldIndex].categoryId;
    await reorderClothing(categoryId, reordered.map(i => i.id));
  };

  const handleDelete = async (id: string) => {
    await deleteClothing(id);
    setDeleteConfirmId(null);
  };

  const selectedCat = selectedCategoryId ? getCategoryById(selectedCategoryId) : null;

  if (items.length === 0 && !searchQuery) {
    return <EmptyState onAdd={onAddClothing} categoryName={selectedCat?.name} />;
  }

  return (
    <div className="p-4">
      {/* Results count */}
      {searchQuery && (
        <div className="mb-3 text-sm text-[#9d8860]">
          搜索「{searchQuery}」找到 {items.length} 件衣物
        </div>
      )}

      {items.length === 0 && searchQuery ? (
        <div className="text-center py-16 text-[#9d8860]">
          <div className="text-4xl mb-3">🔍</div>
          <p>没有找到匹配的衣物</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map(i => i.id)}
            strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {items.map(item => (
                  <ClothingCard
                    key={item.id}
                    item={item}
                    onEdit={onEditClothing}
                    onDelete={(id) => setDeleteConfirmId(id)}
                    onMove={(id) => setMoveItemId(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <ClothingListItem
                    key={item.id}
                    item={item}
                    onEdit={onEditClothing}
                    onDelete={(id) => setDeleteConfirmId(id)}
                    onMove={(id) => setMoveItemId(id)}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </DndContext>
      )}

      {/* Move modal */}
      {moveItemId && (
        <MoveItemModal
          itemId={moveItemId}
          onClose={() => setMoveItemId(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-[#3d3423] mb-2">删除衣物</h3>
            <p className="text-sm text-[#7d6b49] mb-4">确认删除这件衣物？此操作不可撤销。</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm text-[#7d6b49] hover:bg-[#f5f0e8] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
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
