"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Lightbulb, PlugZap, Zap } from "lucide-react";

import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { DeviceStatusPanel } from "@/components/dashboard/DeviceStatusPanel";
import { PowerMeter } from "@/components/dashboard/PowerMeter";
import { ReconnectingBanner } from "@/components/dashboard/ReconnectingBanner";
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
  const activeRoomsCount = rooms.filter((room) =>
    room.devices.some((device) => device.status === "on"),
  ).length;
  const dateRangeLabel = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);

    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <section
        id="overview"
        className="flex flex-col gap-3 rounded-lg border border-pos-borderLight bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-[24px] font-bold leading-[28.8px] text-pos-textPrimary">
            Welcome, Boss
          </h1>
          <p className="mt-1.5 text-[13px] leading-[19.5px] text-pos-textMuted">
            {activeRoomsCount} active rooms, {devicesOnCount} devices on, and live
            office monitoring in one place.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-lg border border-pos-borderLight bg-white px-3 py-2 text-[13px] font-medium text-pos-textPrimary">
          <CalendarDays size={14} className="text-pos-orange" />
          {dateRangeLabel}
        </div>
      </section>

      <ReconnectingBanner show={showReconnectBanner} />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1.8fr] xl:items-stretch">
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
        <PowerMeter compact />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_330px]">
        <div className="rounded-lg border border-pos-borderLight bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-pos-textMuted">
                Live Visualization
              </p>
              <h3 className="text-[20px] font-bold leading-[24px] text-pos-textPrimary">
                Animated Floor Plan
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-pos-orange/10 px-2.5 py-1.5 text-[11px] font-bold text-pos-orange">
              <Lightbulb size={12} />
              Live sync enabled
            </div>
          </div>
          <OfficeFloorPlan devices={devices} roomsById={roomsById} />
        </div>
        <div className="space-y-5">
          <AlertsPanel />
        </div>
      </section>

      <section className="grid gap-5">
        <DeviceStatusPanel />
      </section>
    </div>
  );
}
