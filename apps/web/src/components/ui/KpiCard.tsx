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
    badge: "bg-white text-pos-orange",
    card: "border border-pos-borderLight bg-pos-orange text-white",
  },
  navy: {
    badge: "bg-white text-pos-navy",
    card: "border border-pos-borderLight bg-pos-navy text-white",
  },
  green: {
    badge: "bg-white text-pos-green",
    card: "border border-pos-borderLight bg-[#10B981] text-white",
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
    <article className={cn("flex min-h-[156px] flex-col rounded-lg p-4", styles.card)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-white/85">
          {label}
        </p>
        <div className={cn("rounded-lg p-2.5", styles.badge)}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <div className="text-[34px] font-bold leading-[40px] text-white">{value}</div>
        {sublabel ? (
          <p className="mt-2 text-[14px] leading-[21px] text-white/85">{sublabel}</p>
        ) : null}
      </div>
    </article>
  );
}
