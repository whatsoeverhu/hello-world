import { useState, useRef } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { ClothingGrid } from './components/Clothing/ClothingGrid';
import { AddClothingPanel } from './components/Clothing/AddClothingPanel';
import { ImportPanel } from './components/Import/ImportPanel';
import { BrandLogoManager } from './components/BrandLogoManager/BrandLogoManager';
import { exportData, importData } from './utils/dataIO';
import type { ClothingItem } from './db/types';

type Panel = 'add' | 'edit' | 'import' | 'brandLogos' | null;

function WardrobeApp() {
  const { loading, refreshData, selectedCategoryId } = useApp();
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [importPrefill, setImportPrefill] = useState<Partial<ClothingItem> | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddClothing = () => {
    setEditingItem(null);
    setImportPrefill(null);
    setActivePanel('add');
  };

  const handleEditClothing = (item: ClothingItem) => {
    setEditingItem(item);
    setActivePanel('edit');
  };

  const handleImportUrl = () => {
    setActivePanel('import');
  };

  const handleExport = async () => {
    try {
      await exportData();
      showToast('数据导出成功');
    } catch {
      showToast('导出失败', 'error');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importData(file);
    await refreshData();
    showToast(result.message, result.success ? 'success' : 'error');
    e.target.value = '';
  };

  const handleImportDone = (data: {
    brand: string;
    notes: string;
    price?: number;
    purchaseUrl: string;
    imageUrl?: string;
    categoryId: string;
  }) => {
    setImportPrefill({
      brand: data.brand,
      notes: data.notes,
      price: data.price,
      purchaseUrl: data.purchaseUrl,
      categoryId: data.categoryId,
      images: data.imageUrl ? [data.imageUrl] : [],
      coverIndex: 0,
      sortOrder: 0,
    } as Partial<ClothingItem>);
    setActivePanel('add');
  };

  const closePanel = () => {
    setActivePanel(null);
    setEditingItem(null);
    setImportPrefill(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center">
          <div className="text-5xl mb-4">🪞</div>
          <p className="text-[#9d8860] text-sm">正在整理衣柜...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#faf8f5] overflow-hidden">
      <Header
        onAddClothing={handleAddClothing}
        onImport={handleImportUrl}
        onExport={handleExport}
        onImportFile={() => importFileRef.current?.click()}
        onBrandLogos={() => setActivePanel('brandLogos')}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <ClothingGrid
            onAddClothing={handleAddClothing}
            onEditClothing={handleEditClothing}
          />
        </main>
      </div>

      {/* Add/Edit clothing panel */}
      {(activePanel === 'add' || activePanel === 'edit') && (
        <AddClothingPanel
          item={editingItem}
          defaultCategoryId={importPrefill?.categoryId ?? selectedCategoryId}
          onClose={closePanel}
          // Pass prefill for import flow
          {...(importPrefill && !editingItem ? { prefill: importPrefill } : {})}
        />
      )}

      {/* Import panel */}
      {activePanel === 'import' && (
        <ImportPanel
          onClose={closePanel}
          onImportDone={handleImportDone}
        />
      )}

      {/* Brand logo manager */}
      {activePanel === 'brandLogos' && (
        <BrandLogoManager onClose={closePanel} />
      )}

      {/* Hidden file input for data import */}
      <input
        ref={importFileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Toast notifications */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <WardrobeApp />
    </AppProvider>
  );
}

export default App;
