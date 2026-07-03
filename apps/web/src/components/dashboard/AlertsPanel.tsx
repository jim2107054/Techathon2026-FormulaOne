"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { useAlerts } from "@/hooks/useAlerts";
import { formatRelativeTime } from "@/lib/time";

export function AlertsPanel() {
  const { alerts } = useAlerts();

  return (
    <section className="rounded-card bg-white p-5 shadow-card">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-pos-textMuted">
          Required Panel
        </p>
        <h3 className="text-xl font-extrabold text-pos-textPrimary">Active Alerts</h3>
      </div>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 rounded-card border border-pos-green/20 bg-pos-green/10 px-4 py-5 text-pos-green">
          <CheckCircle2 size={18} />
          <span className="font-bold">No active alerts - everything looks good.</span>
        </div>
      ) : (
        <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
          <AnimatePresence initial={false}>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-card border border-pos-borderLight bg-slate-50 px-4 py-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle
                    className={
                      alert.type === "after_hours" ? "text-pos-red" : "text-pos-amber"
                    }
                    size={16}
                  />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-pos-textMuted">
                    {alert.type.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm font-bold text-pos-textPrimary">{alert.message}</p>
                <p className="mt-2 text-xs font-semibold text-pos-textMuted">
                  {formatRelativeTime(new Date(alert.createdAt))}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
