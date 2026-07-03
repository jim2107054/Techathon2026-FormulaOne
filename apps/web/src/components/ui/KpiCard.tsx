import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  variant: "orange" | "navy" | "green";
};

const variantStyles = {
  orange: {
    badge: "bg-pos-orange/15 text-pos-orange",
    hover: "hover:shadow-kpiOrange",
  },
  navy: {
    badge: "bg-pos-navy/10 text-pos-navy",
    hover: "hover:shadow-kpiNavy",
  },
  green: {
    badge: "bg-pos-green/10 text-pos-green",
    hover: "hover:shadow-kpiGreen",
  },
};

export function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  variant,
}: KpiCardProps) {
  const styles = variantStyles[variant];

  return (
    <article
      className={cn(
        "rounded-card bg-white p-5 shadow-card transition-shadow",
        styles.hover,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-pos-textMuted">
          {label}
        </p>
        <div className={cn("rounded-full p-3", styles.badge)}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-pos-textPrimary">{value}</div>
      {sublabel ? (
        <p className="mt-2 text-sm font-semibold text-pos-textMuted">{sublabel}</p>
      ) : null}
    </article>
  );
}
