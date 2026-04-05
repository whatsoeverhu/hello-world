import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ClothingItem } from '../../db/types';
import { useApp } from '../../store/AppContext';
import { TemperatureBar } from './TemperatureBar';
import { BrandBadge } from './BrandBadge';

interface Props {
  item?: ClothingItem | null;
  defaultCategoryId?: string | null;
  prefill?: Partial<ClothingItem> | null;
  onClose: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AddClothingPanel({ item, defaultCategoryId, prefill, onClose }: Props) {
  const { addClothing, updateClothing, categories, selectedCategoryId, getAllBrands, clothing } = useApp();

  const [images, setImages] = useState<string[]>(item?.images ?? prefill?.images ?? []);
  const [coverIndex, setCoverIndex] = useState(item?.coverIndex ?? 0);
  const [brand, setBrand] = useState(item?.brand ?? prefill?.brand ?? '');
  const [categoryId, setCategoryId] = useState(
    item?.categoryId ?? prefill?.categoryId ?? defaultCategoryId ?? selectedCategoryId ?? (categories[0]?.id ?? '')
  );
  const [tempEnabled, setTempEnabled] = useState(!!item?.tempRange);
  const [tempMin, setTempMin] = useState(item?.tempRange?.min ?? 15);
  const [tempMax, setTempMax] = useState(item?.tempRange?.max ?? 25);
  const [price, setPrice] = useState(item?.price?.toString() ?? prefill?.price?.toString() ?? '');
  const [purchaseDate, setPurchaseDate] = useState(item?.purchaseDate ?? '');
  const [purchaseUrl, setPurchaseUrl] = useState(item?.purchaseUrl ?? prefill?.purchaseUrl ?? '');
  const [notes, setNotes] = useState(item?.notes ?? prefill?.notes ?? '');
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const allBrands = getAllBrands();

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Brand autocomplete
  useEffect(() => {
    if (!brand.trim()) {
      setBrandSuggestions([]);
      return;
    }
    const matches = allBrands.filter(b => b.toLowerCase().includes(brand.toLowerCase()) && b !== brand);
    setBrandSuggestions(matches.slice(0, 6));
  }, [brand, allBrands]);

  const handleImageFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newImages = await Promise.all(arr.map(fileToBase64));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await handleImageFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    if (e.dataTransfer.files) await handleImageFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (coverIndex >= next.length) setCoverIndex(Math.max(0, next.length - 1));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !categoryId) return;
    setSaving(true);

    const data = {
      categoryId,
      images,
      coverIndex,
      brand: brand.trim(),
      tempRange: tempEnabled ? { min: tempMin, max: tempMax } : undefined,
      price: price ? parseFloat(price) : undefined,
      purchaseDate: purchaseDate || undefined,
      purchaseUrl: purchaseUrl || undefined,
      notes: notes || undefined,
      sortOrder: item?.sortOrder ?? clothing.filter(c => c.categoryId === categoryId).length,
    };

    try {
      if (item) {
        await updateClothing(item.id, data);
      } else {
        await addClothing(data);
      }
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const renderCategoryOption = (cat: typeof categories[0], depth = 0): React.ReactNode => {
    const prefix = '\u00a0'.repeat(depth * 3);
    const children = categories.filter(c => c.parentId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder);
    return (
      <React.Fragment key={cat.id}>
        <option value={cat.id}>{prefix}{cat.icon && `${cat.icon} `}{cat.name}</option>
        {children.map(child => renderCategoryOption(child, depth + 1))}
      </React.Fragment>
    );
  };

  const topLevelCats = categories.filter(c => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#faf8f5] z-50 shadow-2xl flex flex-col transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede4d3] bg-white">
          <h2 className="font-semibold text-[#3d3423]">{item ? '编辑衣物' : '添加衣物'}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[#f5f0e8] text-[#9d8860] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-[#9d8860] mb-2">图片 *</label>

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${draggingOver ? 'border-[#4a6741] bg-[#f0f4ee]' : 'border-[#ddd0b8] hover:border-[#9d8860]'}`}
                onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
                onDragLeave={() => setDraggingOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <svg className="w-8 h-8 mx-auto mb-2 text-[#c9b898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-[#9d8860]">点击上传或拖拽图片</p>
                <p className="text-xs text-[#c9b898] mt-1">支持 JPG、PNG、WEBP</p>
              </div>

              {/* Image previews */}
              {images.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${idx === coverIndex ? 'border-[#4a6741]' : 'border-transparent hover:border-[#c9b898]'}`}
                      onClick={() => setCoverIndex(idx)}
                    >
                      <img src={img} alt="" className="w-16 h-16 object-cover" />
                      {idx === coverIndex && (
                        <div className="absolute inset-0 bg-[#4a6741]/20 flex items-end justify-center pb-1">
                          <span className="text-white text-[10px] font-medium bg-[#4a6741] px-1.5 rounded">封面</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Brand */}
            <div className="relative">
              <label className="block text-xs font-medium text-[#9d8860] mb-1.5">
                品牌 *
              </label>
              <div className="flex items-center gap-2">
                {brand && <BrandBadge brand={brand} size={28} />}
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="如：Nike、Uniqlo..."
                  className="flex-1 px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] focus:ring-1 focus:ring-[#9d8860]"
                />
              </div>
              {showSuggestions && brandSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ede4d3] rounded-lg shadow-lg z-10 overflow-hidden">
                  {brandSuggestions.map(b => (
                    <button
                      key={b}
                      type="button"
                      onMouseDown={() => { setBrand(b); setShowSuggestions(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-[#3d3423] hover:bg-[#f5f0e8] flex items-center gap-2"
                    >
                      <BrandBadge brand={b} size={20} />
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#9d8860] mb-1.5">分类 *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] bg-white"
              >
                {topLevelCats.map(cat => renderCategoryOption(cat))}
              </select>
            </div>

            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#9d8860]">推荐穿着温度</label>
                <button
                  type="button"
                  onClick={() => setTempEnabled(!tempEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${tempEnabled ? 'bg-[#4a6741]' : 'bg-[#ddd0b8]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${tempEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {tempEnabled && (
                <div className="space-y-3 bg-[#f5f0e8] rounded-xl p-3">
                  <TemperatureBar min={tempMin} max={tempMax} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#9d8860] mb-1 block">最低温度 ({tempMin}°C)</label>
                      <input
                        type="range"
                        min={-10}
                        max={40}
                        value={tempMin}
                        onChange={e => {
                          const v = parseInt(e.target.value);
                          setTempMin(Math.min(v, tempMax - 1));
                        }}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#9d8860] mb-1 block">最高温度 ({tempMax}°C)</label>
                      <input
                        type="range"
                        min={-10}
                        max={40}
                        value={tempMax}
                        onChange={e => {
                          const v = parseInt(e.target.value);
                          setTempMax(Math.max(v, tempMin + 1));
                        }}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-medium text-[#9d8860] mb-1.5">价格（元）</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9d8860] text-sm">¥</span>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] focus:ring-1 focus:ring-[#9d8860]"
                />
              </div>
            </div>

            {/* Purchase date */}
            <div>
              <label className="block text-xs font-medium text-[#9d8860] mb-1.5">购买日期</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] bg-white"
              />
            </div>

            {/* Purchase URL */}
            <div>
              <label className="block text-xs font-medium text-[#9d8860] mb-1.5">购买链接</label>
              <input
                type="url"
                value={purchaseUrl}
                onChange={e => setPurchaseUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] focus:ring-1 focus:ring-[#9d8860]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-[#9d8860] mb-1.5">备注</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="颜色、尺码、穿搭建议..."
                rows={3}
                className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] focus:ring-1 focus:ring-[#9d8860] resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#ede4d3] bg-white flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 text-sm text-[#7d6b49] hover:bg-[#f5f0e8] rounded-xl transition-colors border border-[#ede4d3]"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!brand.trim() || !categoryId || saving}
            className="flex-1 py-2.5 text-sm bg-[#4a6741] text-white hover:bg-[#3d5636] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? '保存中...' : item ? '保存修改' : '添加衣物'}
          </button>
        </div>
      </div>
    </>
  );
}
