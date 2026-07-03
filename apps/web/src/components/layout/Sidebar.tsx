import { LayoutDashboard } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 bg-pos-navy px-6 py-8 text-white lg:block">
      <div className="mb-10">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.32em] text-white/60">
          FormulaOne
        </div>
        <h1 className="text-2xl font-extrabold">Office Monitor</h1>
      </div>
      <nav>
        <div className="flex items-center gap-3 rounded-card bg-white/10 px-4 py-3 text-sm font-bold">
          <LayoutDashboard size={18} />
          Dashboard
        </div>
      </nav>
    </aside>
  );
}
