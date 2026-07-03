import { cn } from "@/lib/utils";

type TopBarProps = {
  title: string;
  connected: boolean;
};

export function TopBar({ title, connected }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-pos-borderLight bg-white px-5 py-4 lg:px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-pos-textMuted">
          Live Dashboard
        </p>
        <h2 className="text-2xl font-extrabold text-pos-textPrimary">{title}</h2>
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
