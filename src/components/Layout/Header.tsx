import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';

interface HeaderProps {
  onAddClothing: () => void;
  onImport: () => void;
  onExport: () => void;
  onImportFile?: () => void;
  onBrandLogos?: () => void;
}

export function Header({ onAddClothing, onImport, onExport, onImportFile, onBrandLogos }: HeaderProps) {
  const { viewMode, setViewMode, searchQuery, setSearchQuery, toggleSidebar, selectedCategoryId, getCategoryById, categories } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const selectedCat = selectedCategoryId ? getCategoryById(selectedCategoryId) : null;

  // Build breadcrumb
  const getBreadcrumb = () => {
    if (!selectedCat) return [];
    const path: typeof selectedCat[] = [];
    let current: typeof selectedCat | undefined = selectedCat;
    while (current) {
      path.unshift(current);
      current = current.parentId ? categories.find(c => c.id === current!.parentId) : undefined;
    }
    return path;
  };
  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-10 bg-[#faf8f5] border-b border-[#ede4d3] px-4 py-3 flex items-center gap-3">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-[#f5f0e8] text-[#7d6b49] transition-colors"
        title="切换侧栏"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo / Title */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-xl">🪞</span>
        <span className="font-semibold text-[#5c4033] text-sm hidden sm:block">电子衣柜</span>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="hidden sm:flex items-center gap-1 text-sm text-[#9d8860]">
          <span className="text-[#c9b898]">/</span>
          {breadcrumb.map((cat, i) => (
            <React.Fragment key={cat!.id}>
              {i > 0 && <span className="text-[#c9b898]">/</span>}
              <span className={i === breadcrumb.length - 1 ? 'text-[#5c4033] font-medium' : ''}>
                {cat!.icon && <span className="mr-1">{cat!.icon}</span>}
                {cat!.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9b898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="搜索品牌、备注..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 py-2 bg-[#f5f0e8] border border-[#ede4d3] rounded-xl text-sm text-[#5c4033] placeholder-[#c9b898] focus:outline-none focus:border-[#9d8860] focus:ring-1 focus:ring-[#9d8860] w-44 sm:w-56 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c9b898] hover:text-[#7d6b49]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* View mode toggle */}
      <div className="flex bg-[#f5f0e8] rounded-lg p-0.5">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#5c4033]' : 'text-[#c9b898] hover:text-[#7d6b49]'}`}
          title="网格视图"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#5c4033]' : 'text-[#c9b898] hover:text-[#7d6b49]'}`}
          title="列表视图"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* More menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg hover:bg-[#f5f0e8] text-[#7d6b49] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
          </svg>
        </button>
        {showMenu && (
          <div className="absolute right-0 top-10 bg-white border border-[#ede4d3] rounded-xl shadow-lg py-1 z-50 min-w-36">
            <button
              onClick={() => { onImport(); setShowMenu(false); }}
              className="w-full text-left px-4 py-2 text-sm text-[#5c4033] hover:bg-[#f5f0e8] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              购物链接导入
            </button>
            {onImportFile && (
              <button
                onClick={() => { onImportFile(); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-[#5c4033] hover:bg-[#f5f0e8] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                导入备份
              </button>
            )}
            <button
              onClick={() => { onExport(); setShowMenu(false); }}
              className="w-full text-left px-4 py-2 text-sm text-[#5c4033] hover:bg-[#f5f0e8] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出备份
            </button>
            {onBrandLogos && (
              <button
                onClick={() => { onBrandLogos(); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-[#5c4033] hover:bg-[#f5f0e8] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                品牌 Logo 管理
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={onAddClothing}
        className="flex items-center gap-1.5 bg-[#4a6741] hover:bg-[#3d5636] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">添加衣物</span>
        <span className="sm:hidden">添加</span>
      </button>
    </header>
  );
}
