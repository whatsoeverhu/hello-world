import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';

interface ParsedProduct {
  title: string;
  price?: string;
  brand?: string;
  imageUrl?: string;
  suggestedCategory?: string;
}

interface Props {
  onClose: () => void;
  onImportDone: (data: { brand: string; notes: string; price?: number; purchaseUrl: string; imageUrl?: string; categoryId: string }) => void;
}

const PLATFORM_HINTS: Record<string, string> = {
  'taobao.com': '淘宝',
  'tmall.com': '天猫',
  'jd.com': '京东',
  'douyin.com': '抖音',
  'pinduoduo.com': '拼多多',
  'yangkeduo.com': '拼多多',
};

// Keyword → category mapping
const KEYWORD_CATEGORY_MAP: Array<{ keywords: string[]; categoryId: string }> = [
  { keywords: ['衬衫', 'shirt'], categoryId: 'top-shirt' },
  { keywords: ['t恤', 'tshirt', 't-shirt'], categoryId: 'top-tshirt' },
  { keywords: ['卫衣', 'hoodie', 'sweatshirt'], categoryId: 'top-hoodie' },
  { keywords: ['外套', '夹克', 'jacket', 'coat'], categoryId: 'top-jacket' },
  { keywords: ['牛仔裤', 'jeans', 'denim'], categoryId: 'bottom-jeans' },
  { keywords: ['休闲裤', '长裤', 'pants', 'trousers'], categoryId: 'bottom-pants' },
  { keywords: ['短裤', 'shorts'], categoryId: 'bottom-shorts' },
  { keywords: ['鞋', 'sneakers', 'shoes', 'boots'], categoryId: 'shoes' },
  { keywords: ['双肩包', 'backpack'], categoryId: 'bag-backpack' },
  { keywords: ['手提包', 'tote', 'handbag'], categoryId: 'bag-tote' },
  { keywords: ['包', 'bag'], categoryId: 'bag' },
  { keywords: ['上装', '上衣', 'top'], categoryId: 'top' },
  { keywords: ['下装', '裤', 'bottom'], categoryId: 'bottom' },
];

function detectCategoryFromTitle(title: string): string | null {
  const lower = title.toLowerCase();
  for (const mapping of KEYWORD_CATEGORY_MAP) {
    if (mapping.keywords.some(kw => lower.includes(kw))) {
      return mapping.categoryId;
    }
  }
  return null;
}

function getPlatformName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    for (const [domain, name] of Object.entries(PLATFORM_HINTS)) {
      if (hostname.includes(domain)) return name;
    }
    return '外部链接';
  } catch {
    return '未知';
  }
}

export function ImportPanel({ onClose, onImportDone }: Props) {
  const { categories } = useApp();
  const [url, setUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedProduct | null>(null);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(true);

  // Manual fallback fields
  const [manualBrand, setManualBrand] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [mode, setMode] = useState<'url' | 'manual'>('url');

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleParseUrl = async () => {
    if (!url.trim()) return;
    setParsing(true);
    setError('');
    setParsed(null);

    try {
      // Since we're purely frontend, we use a CORS proxy or just parse what we can from the URL
      // For real parsing, we'd need a backend. Here we do best-effort URL parsing + guidance.
      const platform = getPlatformName(url);

      // Try to extract item ID from URL for display purposes
      let title = '';
      let priceStr = '';

      // Some platforms embed product name in URL params
      try {
        const urlObj = new URL(url);
        title = urlObj.searchParams.get('name') || urlObj.searchParams.get('title') || '';
      } catch {}

      setParsed({
        title: title || `${platform}商品`,
        brand: '',
        price: priceStr,
        imageUrl: '',
        suggestedCategory: title ? detectCategoryFromTitle(title) ?? undefined : undefined,
      });

      // Pre-fill manual fields
      setManualTitle(title);
      setManualBrand('');
      setManualPrice(priceStr);
      if (title) {
        const catId = detectCategoryFromTitle(title);
        setSelectedCatId(catId ?? '');
      }
    } catch (err) {
      setError('无法解析链接，请手动填写商品信息');
      setMode('manual');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = () => {
    const catId = selectedCatId || categories.find(c => c.parentId === null)?.id || '';
    onImportDone({
      brand: manualBrand || parsed?.brand || '',
      notes: manualTitle || parsed?.title || '',
      price: manualPrice ? parseFloat(manualPrice) : undefined,
      purchaseUrl: url,
      imageUrl: parsed?.imageUrl || undefined,
      categoryId: catId,
    });
    handleClose();
  };

  const renderOption = (cat: typeof categories[0], depth = 0): React.ReactNode => {
    const prefix = '\u00a0'.repeat(depth * 3);
    const children = categories.filter(c => c.parentId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder);
    return (
      <React.Fragment key={cat.id}>
        <option value={cat.id}>{prefix}{cat.icon && `${cat.icon} `}{cat.name}</option>
        {children.map(child => renderOption(child, depth + 1))}
      </React.Fragment>
    );
  };

  const topLevel = categories.filter(c => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#faf8f5] z-50 shadow-2xl flex flex-col transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede4d3] bg-white">
          <h2 className="font-semibold text-[#3d3423]">从购物链接导入</h2>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-[#f5f0e8] text-[#9d8860]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Platform hints */}
          <div className="bg-[#f5f0e8] rounded-xl p-3">
            <p className="text-xs text-[#9d8860] mb-2 font-medium">支持以下平台</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(PLATFORM_HINTS).map(name => (
                <span key={name} className="text-xs bg-white px-2 py-0.5 rounded-full text-[#7d6b49] border border-[#ede4d3]">{name}</span>
              ))}
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex bg-[#f5f0e8] rounded-lg p-0.5">
            <button
              onClick={() => setMode('url')}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${mode === 'url' ? 'bg-white shadow-sm text-[#3d3423] font-medium' : 'text-[#9d8860]'}`}
            >
              粘贴链接
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${mode === 'manual' ? 'bg-white shadow-sm text-[#3d3423] font-medium' : 'text-[#9d8860]'}`}
            >
              手动填写
            </button>
          </div>

          {mode === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#9d8860] mb-1.5">商品链接</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="粘贴淘宝、京东等链接..."
                    className="flex-1 px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860]"
                  />
                  <button
                    onClick={handleParseUrl}
                    disabled={!url.trim() || parsing}
                    className="px-3 py-2 bg-[#4a6741] text-white text-sm rounded-lg hover:bg-[#3d5636] disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {parsing ? '解析中...' : '解析'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                  ⚠️ {error}
                </div>
              )}

              {parsed && (
                <div className="bg-white rounded-xl border border-[#ede4d3] p-4 space-y-3">
                  <p className="text-xs font-medium text-[#9d8860]">解析结果（请核对并补充）</p>
                  <div className="text-sm text-[#5c4033]">{parsed.title}</div>

                  {parsed.suggestedCategory && (
                    <div className="flex items-center gap-1.5 text-xs text-[#4a6741] bg-[#f0f4ee] px-2 py-1 rounded-lg">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      智能推荐分类
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual / confirmation fields */}
          {(mode === 'manual' || parsed) && (
            <div className="space-y-4 bg-white rounded-xl border border-[#ede4d3] p-4">
              <p className="text-xs font-medium text-[#9d8860]">{mode === 'manual' ? '手动填写商品信息' : '补充信息'}</p>

              <div>
                <label className="block text-xs text-[#9d8860] mb-1">品牌名称</label>
                <input
                  type="text"
                  value={manualBrand}
                  onChange={e => setManualBrand(e.target.value)}
                  placeholder="如：Nike"
                  className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9d8860] mb-1">商品标题 / 备注</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={e => {
                    setManualTitle(e.target.value);
                    const catId = detectCategoryFromTitle(e.target.value);
                    if (catId && !selectedCatId) setSelectedCatId(catId);
                  }}
                  placeholder="商品名称..."
                  className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9d8860] mb-1">价格（元）</label>
                <input
                  type="number"
                  value={manualPrice}
                  onChange={e => setManualPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9d8860] mb-1">分类</label>
                <select
                  value={selectedCatId}
                  onChange={e => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#ede4d3] rounded-lg text-sm text-[#3d3423] focus:outline-none focus:border-[#9d8860] bg-white"
                >
                  <option value="">选择分类...</option>
                  {topLevel.map(cat => renderOption(cat))}
                </select>
              </div>
            </div>
          )}

          {/* Note about CORS limitations */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs text-blue-600 leading-relaxed">
              💡 由于浏览器安全限制，无法直接读取购物平台页面内容。建议复制商品标题并手动填写，或截图上传后手动录入信息。
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#ede4d3] bg-white flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 text-sm text-[#7d6b49] hover:bg-[#f5f0e8] rounded-xl border border-[#ede4d3] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={(!manualBrand && !parsed?.brand) || !selectedCatId}
            className="flex-1 py-2.5 text-sm bg-[#4a6741] text-white hover:bg-[#3d5636] rounded-xl transition-colors disabled:opacity-50 font-medium"
          >
            导入添加
          </button>
        </div>
      </div>
    </>
  );
}
