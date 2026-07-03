"use client";

import { Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard } from "@/components/ui/KpiCard";
import { useUsage } from "@/hooks/useUsage";

export function PowerMeter() {
  const { usage } = useUsage();

  const chartData = Object.entries(usage.perRoomWatts).map(([roomName, watts]) => ({
    roomName,
    watts,
  }));

  return (
    <section className="rounded-card bg-white p-5 shadow-card">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-pos-textMuted">
          Required Panel
        </p>
        <h3 className="text-xl font-extrabold text-pos-textPrimary">Power Meter</h3>
      </div>
      <div className="mb-5">
        <KpiCard
          icon={Zap}
          label="Total Power"
          value={`${usage.totalWattsNow} W`}
          sublabel={`${usage.estimatedKwhToday} kWh today`}
          variant="orange"
        />
      </div>
      <div className="h-72 rounded-card border border-pos-borderLight bg-slate-50 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E6EAED" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="roomName"
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fill: "#212B36", fontSize: 12, fontWeight: 700 }}
            />
            <Bar dataKey="watts" radius={[0, 8, 8, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.roomName} fill="#092C4C" />
              ))}
              <LabelList
                dataKey="watts"
                position="right"
                fill="#212B36"
                fontSize={12}
                fontWeight={800}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
