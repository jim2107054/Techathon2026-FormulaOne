"use client";

import { Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard } from "@/components/ui/KpiCard";
import { useUsage } from "@/hooks/useUsage";

type PowerMeterProps = {
  compact?: boolean;
};

export function PowerMeter({ compact = false }: PowerMeterProps) {
  const { usage } = useUsage();

  const chartData = Object.entries(usage.perRoomWatts).map(([roomName, watts]) => {
    const shortName =
      roomName === "Drawing Room"
        ? "Drawing"
        : roomName === "Work Room 1"
          ? "Work 1"
          : roomName === "Work Room 2"
            ? "Work 2"
            : roomName;

    return {
      roomName,
      shortName,
      watts,
      remainder: Math.max(0, 100 - watts),
    };
  });

  const chart = (
    <div className="h-[230px] rounded-lg border border-pos-borderLight bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 6, right: 8, bottom: 2, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6EAED" vertical={false} />
          <XAxis
            dataKey="shortName"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#646B72", fontSize: 11, fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#646B72", fontSize: 11, fontWeight: 600 }}
            width={36}
          />
          <Bar dataKey="watts" stackId="usage" radius={[8, 8, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.roomName} fill="#FE9F43" />
            ))}
          </Bar>
          <Bar dataKey="remainder" stackId="usage" radius={[8, 8, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={`${entry.roomName}-remainder`} fill="#FDE2C4" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (compact) {
    return (
      <>
        <KpiCard
          icon={Zap}
          label="Total Power"
          value={`${usage.totalWattsNow} W`}
          sublabel={`${usage.estimatedKwhToday} kWh today`}
          variant="orange"
        />
        {chart}
      </>
    );
  }

  return (
    <section className="rounded-lg border border-pos-borderLight bg-white p-4">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-pos-textMuted">
          Required Panel
        </p>
        <h3 className="text-[20px] font-bold leading-[24px] text-pos-textPrimary">
          Power Meter
        </h3>
      </div>
      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <KpiCard
            icon={Zap}
            label="Total Power"
            value={`${usage.totalWattsNow} W`}
            sublabel={`${usage.estimatedKwhToday} kWh today`}
            variant="orange"
          />
        </div>
        {chart}
      </div>
    </section>
  );
}
