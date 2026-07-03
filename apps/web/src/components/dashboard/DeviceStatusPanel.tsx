"use client";

import { motion } from "framer-motion";

import { useRooms } from "@/hooks/useRooms";

export function DeviceStatusPanel() {
  const { rooms } = useRooms();

  return (
    <section className="rounded-card bg-white p-5 shadow-card">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-pos-textMuted">
          Required Panel
        </p>
        <h3 className="text-xl font-extrabold text-pos-textPrimary">Device Status</h3>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {rooms.map((room) => {
          const devices = [...room.devices].sort(
            (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name),
          );

          return (
            <article
              key={room.id}
              className="rounded-card border border-pos-borderLight p-4"
            >
              <h4 className="mb-3 text-lg font-extrabold text-pos-textPrimary">
                {room.displayName}
              </h4>
              <div className="space-y-2">
                {devices.map((device) => {
                  const isOn = device.status === "on";

                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between rounded-card bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <motion.span
                          animate={isOn ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                          transition={
                            isOn
                              ? { repeat: Infinity, duration: 1.2 }
                              : { duration: 0.2 }
                          }
                          className={`h-3 w-3 rounded-full ${
                            isOn ? "bg-pos-green" : "bg-slate-300"
                          }`}
                        />
                        <div>
                          <div className="font-bold text-pos-textPrimary">
                            {device.name}
                          </div>
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-pos-textMuted">
                            {device.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-pos-textPrimary">
                          {isOn ? "ON" : "OFF"}
                        </div>
                        {isOn ? (
                          <div className="text-xs font-semibold text-pos-textMuted">
                            {device.wattage} W
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
