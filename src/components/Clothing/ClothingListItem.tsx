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
}

export function ClothingListItem({ item, onEdit, onDelete, onMove }: Props) {
  const [imgError, setImgError] = useState(false);
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: item.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const coverImage = item.images[item.coverIndex] || item.images[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#ede4d3] hover:border-[#c9b898] transition-all cursor-pointer group"
      onClick={() => onEdit(item)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[#c9b898] hover:text-[#7d6b49] transition-colors flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#f5f0e8] flex-shrink-0">
        {coverImage && !imgError ? (
          <img src={coverImage} alt={item.brand} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#c9b898]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Brand badge */}
      <BrandBadge brand={item.brand} size={28} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-[#3d3423]">{item.brand}</div>
        {item.notes && <div className="text-xs text-[#9d8860] truncate">{item.notes}</div>}
      </div>

      {/* Temperature */}
      {item.tempRange && (
        <div className="w-28 hidden sm:block">
          <TemperatureBar min={item.tempRange.min} max={item.tempRange.max} compact />
        </div>
      )}

      {/* Price */}
      {item.price != null && (
        <div className="text-sm text-[#9d8860] hidden md:block whitespace-nowrap">
          ¥{item.price.toLocaleString()}
        </div>
      )}

      {/* Date */}
      {item.purchaseDate && (
        <div className="text-xs text-[#b5a07a] hidden lg:block whitespace-nowrap">
          {item.purchaseDate}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onMove(item.id)}
          className="p-1.5 hover:bg-[#f5f0e8] text-[#9d8860] hover:text-[#5c4033] rounded-lg transition-colors"
          title="移动"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 hover:bg-red-50 text-[#9d8860] hover:text-red-500 rounded-lg transition-colors"
          title="删除"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
