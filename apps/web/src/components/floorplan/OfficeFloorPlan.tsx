"use client";

import { motion } from "framer-motion";
import type { Device, RoomWithDevices } from "@techathon/shared-types";

type OfficeFloorPlanProps = {
  devices: Device[];
  roomsById?: Record<string, Pick<RoomWithDevices, "displayName" | "name">>;
};

type RoomShape = {
  name: string;
  x: number;
  fill: string;
  stroke: string;
};

type Placement = {
  label: string;
  type: "fan" | "light";
  x: number;
  y: number;
};

const roomShapes: RoomShape[] = [
  { name: "drawing", x: 20, fill: "#FFF7EF", stroke: "#FE9F43" },
  { name: "work1", x: 320, fill: "#F7FAFD", stroke: "#092C4C" },
  { name: "work2", x: 620, fill: "#F7FAFD", stroke: "#092C4C" },
];

const placements: Placement[] = [
  { label: "Fan 1", type: "fan", x: 70, y: 100 },
  { label: "Fan 2", type: "fan", x: 200, y: 100 },
  { label: "Light 1", type: "light", x: 50, y: 40 },
  { label: "Light 2", type: "light", x: 140, y: 40 },
  { label: "Light 3", type: "light", x: 230, y: 40 },
];

export function OfficeFloorPlan({ devices, roomsById = {} }: OfficeFloorPlanProps) {
  const devicesByRoomName = devices.reduce<Record<string, Device[]>>((result, device) => {
    const room = roomsById[device.roomId];

    if (!room) {
      return result;
    }

    if (!result[room.name]) {
      result[room.name] = [];
    }

    result[room.name].push(device);
    return result;
  }, {});

  return (
    <svg viewBox="0 0 920 320" className="w-full">
      {roomShapes.map((roomShape) => {
        const roomDevices = devicesByRoomName[roomShape.name] ?? [];
        const roomDisplayName =
          Object.values(roomsById).find((room) => room.name === roomShape.name)
            ?.displayName ?? roomShape.name;

        return (
          <g key={roomShape.name}>
            <rect
              x={roomShape.x}
              y={30}
              width={280}
              height={220}
              rx={18}
              fill={roomShape.fill}
              stroke={roomShape.stroke}
              strokeWidth={3}
            />
            <text
              x={roomShape.x + 20}
              y={20}
              fill="#212B36"
              fontSize="18"
              fontWeight="800"
            >
              {roomDisplayName}
            </text>

            {roomShape.name === "drawing" ? (
              <>
                <rect
                  x={roomShape.x + 35}
                  y={160}
                  width={110}
                  height={45}
                  rx={18}
                  fill="#D9E7F5"
                />
                <rect
                  x={roomShape.x + 155}
                  y={155}
                  width={70}
                  height={55}
                  rx={14}
                  fill="#FFF0D8"
                />
              </>
            ) : (
              <>
                <rect
                  x={roomShape.x + 30}
                  y={155}
                  width={85}
                  height={42}
                  rx={12}
                  fill="#D9E7F5"
                />
                <rect
                  x={roomShape.x + 150}
                  y={155}
                  width={85}
                  height={42}
                  rx={12}
                  fill="#D9E7F5"
                />
              </>
            )}

            {placements.map((placement) => {
              const device = roomDevices.find((entry) => entry.name === placement.label);
              const isOn = device?.status === "on";
              const key = `${roomShape.name}-${placement.label}`;

              if (placement.type === "light") {
                return (
                  <motion.g
                    key={key}
                    data-device-id={device?.id ?? key}
                    animate={{ opacity: isOn ? 1 : 0.72 }}
                    transition={{ duration: 0.3 }}
                  >
                    <circle
                      cx={roomShape.x + placement.x}
                      cy={placement.y}
                      r="12"
                      fill={isOn ? "#FFC107" : "#CBD5E1"}
                      style={
                        isOn ? { filter: "drop-shadow(0 0 6px #FFC107)" } : undefined
                      }
                    />
                  </motion.g>
                );
              }

              return (
                <g
                  key={key}
                  data-device-id={device?.id ?? key}
                  transform={`translate(${roomShape.x + placement.x} ${placement.y})`}
                >
                  <circle r="18" fill="#EFF6FF" stroke="#092C4C" strokeWidth="2" />
                  <motion.g
                    animate={isOn ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      isOn
                        ? { repeat: Infinity, duration: 1, ease: "linear" }
                        : { duration: 0.3 }
                    }
                  >
                    <path
                      d="M 0 -14 C 7 -14 11 -5 4 0 C 2 1 1 2 0 4 C -1 2 -2 1 -4 0 C -11 -5 -7 -14 0 -14 Z"
                      fill={isOn ? "#092C4C" : "#94A3B8"}
                    />
                    <path
                      d="M 14 0 C 14 7 5 11 0 4 C -1 2 -2 1 -4 0 C -2 -1 -1 -2 0 -4 C 5 -11 14 -7 14 0 Z"
                      fill={isOn ? "#092C4C" : "#94A3B8"}
                    />
                    <path
                      d="M 0 14 C -7 14 -11 5 -4 0 C -2 -1 -1 -2 0 -4 C 1 -2 2 -1 4 0 C 11 5 7 14 0 14 Z"
                      fill={isOn ? "#092C4C" : "#94A3B8"}
                    />
                    <circle r="4" fill="#FE9F43" />
                  </motion.g>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
