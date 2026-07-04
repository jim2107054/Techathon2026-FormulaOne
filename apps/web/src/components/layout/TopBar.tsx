import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";

import { cn } from "@/lib/utils";

type TopBarProps = {
  title: string;
  connected: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function TopBar({
  title,
  connected,
  onToggleSidebar,
  sidebarCollapsed,
}: TopBarProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-pos-borderLight bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden rounded-lg border border-pos-borderLight bg-white p-2 text-pos-textPrimary transition hover:bg-slate-50 lg:inline-flex"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={sidebarCollapsed}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pos-textMuted"
          />
          <input
            type="search"
            placeholder="Search"
            className="h-[34px] w-full rounded-lg border border-pos-borderLight bg-white pl-9 pr-3 text-[13px] font-normal text-[#000000] outline-none transition focus:border-[#0D6EFD] focus:ring-[3px] focus:ring-[rgba(13,110,253,0.1)]"
          />
        </div>
      </div>
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold",
          connected
            ? "border-pos-green/20 bg-pos-green/10 text-pos-green"
            : "border-pos-red/20 bg-pos-red/10 text-pos-red",
        )}
      >
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            connected ? "bg-pos-green" : "bg-pos-red",
          )}
        />
        {connected ? "Live" : "Disconnected"}
      </div>
    </header>
  );
}
