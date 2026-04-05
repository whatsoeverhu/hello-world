import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../db/database';
import type { BrandLogo } from '../../db/types';

interface Props {
  onClose: () => void;
}

export function BrandLogoManager({ onClose }: Props) {
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [brandName, setBrandName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [visible, setVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    db.brandLogos.toArray().then(setLogos);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAdd = async () => {
    if (!brandName.trim() || !previewUrl) return;
    // Check if exists
    const existing = await db.brandLogos.where('brand').equalsIgnoreCase(brandName.trim()).first();
    if (existing) {
      await db.brandLogos.update(existing.id!, { logoUrl: previewUrl });
    } else {
      await db.brandLogos.add({ brand: brandName.trim(), logoUrl: previewUrl });
    }
    const updated = await db.brandLogos.toArray();
    setLogos(updated);
    setBrandName('');
    setPreviewUrl('');
  };

  const handleDelete = async (id: number) => {
    await db.brandLogos.delete(id);
    setLogos(prev => prev.filter(l => l.id !== id));
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#faf8f5] z-50 shadow-2xl flex flex-col transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede4d3] bg-white">
          <h2 className="font-semibold text-[#3d3423]">品牌 Logo 管理</h2>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-[#f5f0e8] text-[#9d8860]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Add logo */}
          <div className="bg-white rounded-xl border border-[#ede4d3] p-4 space-y-3">
            <p className="text-sm font-medium text-[#5c4033]">添加品牌 Logo</p>

            <div>
              <label className="text-xs text-[#9d8860] mb-1 block">品牌名称</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="如：Nike"
                className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860]"
              />
            </div>

            <div>
              <label className="text-xs text-[#9d8860] mb-1 block">Logo 图片</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#7d6b49] hover:bg-[#f5f0e8] transition-colors"
                >
                  选择图片
                </button>
                {previewUrl && (
                  <div className="w-10 h-10 rounded-lg border border-[#ede4d3] overflow-hidden bg-[#f5f0e8]">
                    <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!brandName.trim() || !previewUrl}
              className="w-full py-2 bg-[#4a6741] text-white text-sm rounded-lg hover:bg-[#3d5636] disabled:opacity-50 transition-colors"
            >
              添加
            </button>
          </div>

          {/* Existing logos */}
          <div>
            <p className="text-xs font-medium text-[#9d8860] mb-2">已添加的品牌 Logo（{logos.length}）</p>
            {logos.length === 0 ? (
              <p className="text-sm text-[#c9b898] text-center py-6">暂无自定义 Logo</p>
            ) : (
              <div className="space-y-2">
                {logos.map(logo => (
                  <div key={logo.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#ede4d3]">
                    <div className="w-10 h-10 rounded-lg border border-[#ede4d3] overflow-hidden bg-[#f5f0e8] flex-shrink-0">
                      <img src={logo.logoUrl} alt={logo.brand} className="w-full h-full object-contain p-1" />
                    </div>
                    <span className="flex-1 text-sm text-[#3d3423] font-medium">{logo.brand}</span>
                    <button
                      onClick={() => handleDelete(logo.id!)}
                      className="p-1.5 hover:bg-red-50 text-[#c9b898] hover:text-red-500 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
