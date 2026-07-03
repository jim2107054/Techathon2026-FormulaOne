export function FloorPlanLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-pos-textMuted">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-[#FFC107] shadow-[0_0_10px_#FFC107]" />
        Light ON
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-slate-300" />
        Light OFF
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full border-2 border-pos-navy border-t-transparent animate-spin" />
        Fan ON
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full border-2 border-slate-300" />
        Fan OFF
      </div>
    </div>
  );
}
