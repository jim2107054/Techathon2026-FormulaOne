import { LayoutDashboard, RadioTower } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed: boolean;
};

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-pos-borderLight bg-white py-6 text-pos-textPrimary transition-[width,padding] duration-200 lg:block",
        collapsed ? "w-24 px-3" : "w-64 px-5",
      )}
    >
      <div className={cn("mb-8", collapsed ? "text-center" : "")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pos-orange/10 text-pos-orange">
            <RadioTower size={20} />
          </div>
          {!collapsed ? (
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.28em] text-pos-orange">
                FormulaOne
              </div>
              <h1 className="text-xl font-extrabold text-pos-textPrimary">
                Office Monitor
              </h1>
            </div>
          ) : null}
        </div>
      </div>

      {!collapsed ? (
        <div className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.2em] text-pos-textMuted">
          Main
        </div>
      ) : null}

      <nav className="space-y-2">
        <a
          href="#overview"
          className={cn(
            "flex rounded-lg border-l-[3px] border-pos-orange bg-pos-orange/10 text-sm font-bold text-pos-orange",
            collapsed ? "justify-center px-2 py-3" : "items-center gap-3 px-4 py-3",
          )}
          title="Dashboard"
        >
          <LayoutDashboard size={18} />
          {!collapsed ? <span>Dashboard</span> : null}
        </a>
      </nav>
    </aside>
  );
}
