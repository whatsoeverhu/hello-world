interface Props {
  onAdd: () => void;
  categoryName?: string;
}

export function EmptyState({ onAdd, categoryName }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      {/* Illustration */}
      <div className="w-32 h-32 mb-6 relative">
        <div className="absolute inset-0 rounded-full bg-[#f5f0e8]" />
        <div className="absolute inset-4 flex items-center justify-center text-6xl">
          👔
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#4a6741] rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-[#5c4033] mb-2">
        {categoryName ? `「${categoryName}」还没有衣物` : '衣柜空空如也'}
      </h3>
      <p className="text-sm text-[#9d8860] mb-6 max-w-xs leading-relaxed">
        把你的宝贝衣物添加进来，开始整理你的专属数字衣柜吧
      </p>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3d5636] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        添加第一件衣物
      </button>
    </div>
  );
}
