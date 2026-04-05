import { useApp } from '../../store/AppContext';
import { CategoryTree } from '../Category/CategoryTree';

export function Sidebar() {
  const { sidebarOpen } = useApp();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-[#ede4d3] transition-all duration-300 overflow-hidden flex-shrink-0
          ${sidebarOpen ? 'w-60' : 'w-0 border-r-0'}`}
      >
        <div className="p-3 flex-1 overflow-hidden flex flex-col min-w-60">
          <div className="px-2 py-2 mb-1">
            <h2 className="text-xs font-semibold text-[#c9b898] uppercase tracking-wider">衣柜分类</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <CategoryTree />
          </div>
        </div>
      </aside>

      {/* Mobile drawer (shown when sidebarOpen) */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Drawer */}
          <aside className="relative w-64 bg-white shadow-xl flex flex-col">
            <div className="p-3 flex-1 overflow-hidden flex flex-col">
              <div className="px-2 py-2 mb-1">
                <h2 className="text-xs font-semibold text-[#c9b898] uppercase tracking-wider">衣柜分类</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <CategoryTree />
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
