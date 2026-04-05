import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ClothingItem } from '../../db/types';
import { BrandBadge } from './BrandBadge';
import { TemperatureBar } from './TemperatureBar';

interface Props {
  item: ClothingItem;
  onEdit: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
  onMove: (id: string) => void;
  isDragging?: boolean;
}

export function ClothingCard({ item, onEdit, onDelete, onMove, isDragging }: Props) {
  const [showActions, setShowActions] = useState(false);
  const [imgError, setImgError] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
    zIndex: isSortableDragging ? 10 : undefined,
  };

  const coverImage = item.images[item.coverIndex] || item.images[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-[#ede4d3] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isDragging ? 'opacity-40' : ''}`}
      onClick={() => onEdit(item)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] bg-[#f5f0e8] overflow-hidden">
        {coverImage && !imgError ? (
          <img
            src={coverImage}
            alt={item.brand}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#c9b898]">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">无图片</span>
          </div>
        )}

        {/* Brand badge overlay */}
        <div className="absolute top-2 right-2">
          <BrandBadge brand={item.brand} size={32} />
        </div>

        {/* Multi-image indicator */}
        {item.images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/40 text-white text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {item.images.length} 张
          </div>
        )}

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-black/30 hover:bg-black/50 text-white p-1 rounded-lg cursor-grab active:cursor-grabbing transition-opacity backdrop-blur-sm"
          onClick={e => e.stopPropagation()}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Action buttons overlay */}
        {showActions && (
          <div
            className="absolute bottom-2 right-2 flex gap-1"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => onMove(item.id)}
              className="bg-white/90 hover:bg-white text-[#7d6b49] p-1.5 rounded-lg shadow-sm transition-colors"
              title="移动到其他分类"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="bg-white/90 hover:bg-red-50 text-[#7d6b49] hover:text-red-500 p-1.5 rounded-lg shadow-sm transition-colors"
              title="删除"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-2.5 space-y-1">
        <div className="font-medium text-sm text-[#3d3423] truncate">{item.brand}</div>

        {item.tempRange && (
          <TemperatureBar min={item.tempRange.min} max={item.tempRange.max} compact />
        )}

        {item.price != null && (
          <div className="text-xs text-[#9d8860]">¥{item.price.toLocaleString()}</div>
        )}

        {item.notes && (
          <div className="text-xs text-[#b5a07a] truncate">{item.notes}</div>
        )}
      </div>
    </div>
  );
}
