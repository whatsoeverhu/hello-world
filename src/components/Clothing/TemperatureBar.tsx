interface Props {
  min: number;
  max: number;
  compact?: boolean;
}

export function TemperatureBar({ min, max, compact = false }: Props) {
  // Map temp -10 to 40 degrees across the gradient
  const totalRange = 50; // -10 to 40
  const offset = 10; // shift so -10 = 0%
  const leftPct = Math.max(0, Math.min(100, ((min + offset) / totalRange) * 100));
  const rightPct = Math.max(0, Math.min(100, ((max + offset) / totalRange) * 100));

  const getTempLabel = (t: number) => `${t > 0 ? '+' : ''}${t}°C`;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="relative h-1.5 flex-1 rounded-full overflow-hidden bg-[#ede4d3]">
          <div
            className="temp-gradient absolute inset-y-0 rounded-full opacity-80"
            style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
          />
        </div>
        <span className="text-xs text-[#9d8860] whitespace-nowrap">
          {getTempLabel(min)}~{getTempLabel(max)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[#9d8860]">
        <span>{getTempLabel(min)}</span>
        <span>{getTempLabel(max)}</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden bg-[#ede4d3]">
        <div
          className="temp-gradient absolute inset-y-0 rounded-full"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
      </div>
    </div>
  );
}
