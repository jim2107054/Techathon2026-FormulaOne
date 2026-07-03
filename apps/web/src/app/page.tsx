"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Lightbulb, PlugZap, Zap } from "lucide-react";

import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { DeviceStatusPanel } from "@/components/dashboard/DeviceStatusPanel";
import { PowerMeter } from "@/components/dashboard/PowerMeter";
import { ReconnectingBanner } from "@/components/dashboard/ReconnectingBanner";
import { FloorPlanLegend } from "@/components/floorplan/FloorPlanLegend";
import { OfficeFloorPlan } from "@/components/floorplan/OfficeFloorPlan";
import { KpiCard } from "@/components/ui/KpiCard";
import { useAlerts } from "@/hooks/useAlerts";
import { useRooms } from "@/hooks/useRooms";
import { useSocket } from "@/hooks/useSocket";
import { useUsage } from "@/hooks/useUsage";

export default function DashboardPage() {
  const { rooms } = useRooms();
  const { usage } = useUsage();
  const { alerts } = useAlerts();
  const { connected } = useSocket();
  const [showReconnectBanner, setShowReconnectBanner] = useState(false);

  useEffect(() => {
    if (!connected) {
      setShowReconnectBanner(true);
      return;
    }

    setShowReconnectBanner(false);
  }, [connected]);

  const devices = useMemo(() => rooms.flatMap((room) => room.devices), [rooms]);
  const roomsById = useMemo(
    () =>
      Object.fromEntries(
        rooms.map((room) => [
          room.id,
          { name: room.name, displayName: room.displayName },
        ]),
      ),
    [rooms],
  );
  const devicesOnCount = devices.filter((device) => device.status === "on").length;

  return (
    <div className="space-y-5">
      <ReconnectingBanner show={showReconnectBanner} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          icon={PlugZap}
          label="Devices On"
          value={`${devicesOnCount}`}
          sublabel={`${devices.length} total devices monitored`}
          variant="navy"
        />
        <KpiCard
          icon={Zap}
          label="Total Wattage"
          value={`${usage.totalWattsNow} W`}
          sublabel={`${usage.estimatedKwhToday} kWh estimated today`}
          variant="orange"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={`${alerts.length}`}
          sublabel={alerts.length === 0 ? "System looks healthy" : "Needs attention"}
          variant="green"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-card bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-pos-textMuted">
                Live Visualization
              </p>
              <h3 className="text-xl font-extrabold text-pos-textPrimary">
                Animated Floor Plan
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-pos-orange/10 px-3 py-2 text-xs font-bold text-pos-orange">
              <Lightbulb size={14} />
              Live sync enabled
            </div>
          </div>
          <OfficeFloorPlan devices={devices} roomsById={roomsById} />
          <div className="mt-4">
            <FloorPlanLegend />
          </div>
        </div>
        <AlertsPanel />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        <DeviceStatusPanel />
        <PowerMeter />
      </section>
    </div>
  );
}
