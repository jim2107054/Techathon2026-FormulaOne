"use client";

import { motion } from "framer-motion";
import type { Device, RoomWithDevices } from "@techathon/shared-types";

type OfficeFloorPlanProps = {
  devices: Device[];
  roomsById?: Record<string, Pick<RoomWithDevices, "displayName" | "name">>;
};

type RoomConfig = {
  name: string;
  displayName: string;
  x: number;
  floor: string;
  furniture: "sofa" | "desk";
};

type DevicePlacement = { label: string; type: "fan" | "light"; x: number; y: number };

const ROOM_W = 272;
const ROOM_TOP = 86;
const ROOM_BOTTOM = 406;

const rooms: RoomConfig[] = [
  { name: "drawing", displayName: "DRAWING ROOM", x: 28, floor: "url(#floor-drawing)", furniture: "sofa" },
  { name: "work1", displayName: "WORK ROOM 1", x: 300, floor: "url(#floor-work1)", furniture: "desk" },
  { name: "work2", displayName: "WORK ROOM 2", x: 572, floor: "url(#floor-work2)", furniture: "desk" },
];

// Relative to each room's x offset. 2 fans + 3 lights per room.
const placements: DevicePlacement[] = [
  { label: "Light 1", type: "light", x: 70, y: 108 },
  { label: "Light 2", type: "light", x: 202, y: 108 },
  { label: "Fan 1", type: "fan", x: 136, y: 156 },
  { label: "Fan 2", type: "fan", x: 136, y: 322 },
  { label: "Light 3", type: "light", x: 136, y: 380 },
];

// Desk layout (relative to room x) — 2×2 office desks framing the fans.
const deskLayout = [
  { x: 34, y: 196 },
  { x: 152, y: 196, flip: true },
  { x: 34, y: 262, plant: true },
  { x: 152, y: 262, flip: true },
];

const Plant = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r="12" fill="#6E9151" opacity="0.16" />
    {[-60, -20, 20, 60, 110, 150].map((rotate) => (
      <ellipse key={rotate} rx="5.5" ry="12" fill="#5F8544" transform={`rotate(${rotate}) translate(0 -8)`} />
    ))}
    <circle r="6" fill="#4E6E38" />
  </g>
);

const CeilingFan = ({ cx, cy, on }: { cx: number; cy: number; on: boolean }) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r="26" fill="#5A4A32" opacity={on ? 0.08 : 0.04} />
    <motion.g
      animate={on ? { rotate: 360 } : { rotate: 0 }}
      transition={on ? { repeat: Infinity, duration: 1.1, ease: "linear" } : { duration: 0.5 }}
    >
      {[0, 120, 240].map((angle) => (
        <path
          key={angle}
          transform={`rotate(${angle})`}
          d="M0 -3 C 5 -11 6 -23 2 -31 C 0 -32 -3 -23 -4 -14 C -4 -8 -2 -4 0 -3 Z"
          fill={on ? "#5B3B1E" : "#A79B8B"}
        />
      ))}
      <circle r="5.5" fill={on ? "#432B12" : "#6E6355"} />
      <circle r="2.5" fill="#2C1B0B" />
    </motion.g>
  </g>
);

const CeilingLight = ({ cx, cy, on }: { cx: number; cy: number; on: boolean }) => (
  <g>
    <circle cx={cx} cy={cy} r="13" fill="#FFF6D6" stroke="#D8BD72" strokeWidth="1.5" />
    <motion.circle
      cx={cx}
      cy={cy}
      r="7.5"
      animate={{ fill: on ? "#FFC63A" : "#C4CDD6" }}
      transition={{ duration: 0.3 }}
      style={on ? { filter: "drop-shadow(0 0 8px #FFC63A)" } : undefined}
    />
  </g>
);

const Desk = ({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <rect x="0" y="0" width="64" height="38" rx="3" fill="#CBA06A" stroke="#9C7A4E" strokeWidth="1.2" />
    <rect x="15" y="6" width="24" height="14" rx="1.5" fill="#3D5063" stroke="#293846" />
    <rect x="24" y="20" width="6" height="4" fill="#293846" />
    <rect x="16" y="26" width="30" height="8" rx="2" fill="#333941" />
    <g transform="translate(32 -12)">
      <rect x="-11" y="-8" width="22" height="18" rx="6" fill="#3B404A" />
      <rect x="-8" y="9" width="16" height="6" rx="3" fill="#2C3037" />
    </g>
  </g>
);

const Lounge = ({ x }: { x: number }) => (
  <g>
    {/* rug */}
    <rect x={x + 52} y={214} width={150} height={128} rx="10" fill="#E7D9BF" opacity="0.85" />
    {/* three-seat sofa on the left */}
    <rect x={x + 40} y={180} width="22" height="150" rx="8" fill="#CDBB9C" stroke="#8F806D" />
    <rect x={x + 60} y={186} width="26" height="138" rx="7" fill="#E1D3BB" stroke="#8F806D" />
    {/* coffee table */}
    <rect x={x + 118} y={244} width="58" height="66" rx="5" fill="#A9835A" stroke="#7C6044" />
    {/* armchair, lower-left */}
    <g transform={`translate(${x + 66} ${348}) rotate(24)`}>
      <rect x="-20" y="-22" width="40" height="46" rx="9" fill="#D5C4AB" stroke="#8F806D" />
      <rect x="-11" y="-16" width="26" height="30" rx="6" fill="#EADDCA" />
    </g>
  </g>
);

export function OfficeFloorPlan({ devices, roomsById = {} }: OfficeFloorPlanProps) {
  const devicesByRoom = devices.reduce<Record<string, Device[]>>((acc, device) => {
    const room = roomsById[device.roomId];
    if (!room) return acc;
    acc[room.name] ??= [];
    acc[room.name].push(device);
    return acc;
  }, {});

  const total = devices.length;

  const renderDevice = (roomName: string, placement: DevicePlacement, offsetX: number) => {
    const device = (devicesByRoom[roomName] ?? []).find((entry) => entry.name === placement.label);
    const isOn = device?.status === "on";
    const key = device?.id ?? `${roomName}-${placement.label}`;
    const cx = offsetX + placement.x;

    return placement.type === "fan" ? (
      <g key={key} data-device-id={key}>
        <CeilingFan cx={cx} cy={placement.y} on={isOn} />
      </g>
    ) : (
      <g key={key} data-device-id={key}>
        <CeilingLight cx={cx} cy={placement.y} on={isOn} />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 900 620" className="w-full">
      <defs>
        <pattern id="floor-drawing" width="34" height="34" patternUnits="userSpaceOnUse">
          <rect width="34" height="34" fill="#F2E7D0" />
          <path d="M 34 0 H 0 V 34" fill="none" stroke="#E7D8BC" strokeWidth="1" />
        </pattern>
        <pattern id="floor-work1" width="60" height="16" patternUnits="userSpaceOnUse">
          <rect width="60" height="16" fill="#EAD6B2" />
          <line x1="0" y1="15.5" x2="60" y2="15.5" stroke="#D9C29B" strokeWidth="1" />
          <line x1="30" y1="0" x2="30" y2="16" stroke="#DEC8A2" strokeWidth="0.8" />
        </pattern>
        <pattern id="floor-work2" width="60" height="16" patternUnits="userSpaceOnUse">
          <rect width="60" height="16" fill="#DFC299" />
          <line x1="0" y1="15.5" x2="60" y2="15.5" stroke="#CDAE81" strokeWidth="1" />
          <line x1="30" y1="0" x2="30" y2="16" stroke="#D3B688" strokeWidth="0.8" />
        </pattern>
        <pattern id="corridor-floor" width="60" height="16" patternUnits="userSpaceOnUse">
          <rect width="60" height="16" fill="#EFE3CB" />
          <line x1="0" y1="15.5" x2="60" y2="15.5" stroke="#E2D4B6" strokeWidth="1" />
        </pattern>
      </defs>

      <text x="450" y="34" textAnchor="middle" fontSize="23" fontWeight="800" fill="#212B36">
        OFFICE LAYOUT (TOP VIEW)
      </text>
      <text x="450" y="58" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#7A8086">
        All rooms have 2 Fans and 3 Lights
      </text>

      {/* floors */}
      {rooms.map((room) => (
        <rect
          key={room.name}
          x={room.x}
          y={ROOM_TOP}
          width={ROOM_W}
          height={ROOM_BOTTOM - ROOM_TOP}
          fill={room.floor}
        />
      ))}
      <rect x="28" y={ROOM_BOTTOM} width="816" height="152" fill="url(#corridor-floor)" />

      {/* furniture + devices per room */}
      {rooms.map((room) => (
        <g key={room.name}>
          {room.furniture === "sofa" ? (
            <Lounge x={room.x} />
          ) : (
            deskLayout.map((desk, index) => (
              <g key={`${room.name}-desk-${index}`}>
                <Desk x={room.x + desk.x} y={desk.y} flip={desk.flip} />
                {desk.plant ? <Plant x={room.x + desk.x + 74} y={desk.y + 20} scale={0.5} /> : null}
              </g>
            ))
          )}
          {placements.map((placement) => renderDevice(room.name, placement, room.x))}
        </g>
      ))}

      {/* corner plants in the drawing room */}
      <Plant x={54} y={112} scale={0.95} />
      <Plant x={250} y={368} scale={0.9} />

      {/* walls (drawn over floors so corners look clean) */}
      <rect x="14" y={ROOM_TOP - 2} width="830" height="488" fill="none" stroke="#3E434A" strokeWidth="9" />
      <line x1="300" y1={ROOM_TOP} x2="300" y2={ROOM_BOTTOM} stroke="#3E434A" strokeWidth="4" />
      <line x1="572" y1={ROOM_TOP} x2="572" y2={ROOM_BOTTOM} stroke="#3E434A" strokeWidth="4" />
      <line x1="28" y1={ROOM_BOTTOM} x2="844" y2={ROOM_BOTTOM} stroke="#3E434A" strokeWidth="5" />

      {/* room titles above the wall stroke so they remain fully visible */}
      {rooms.map((room) => (
        <text
          key={`${room.name}-title`}
          x={room.x + ROOM_W / 2}
          y={78}
          textAnchor="middle"
          fontSize="15"
          fontWeight="800"
          fill="#26313C"
        >
          {roomsById &&
          Object.values(roomsById).find((entry) => entry.name === room.name)
            ?.displayName?.toUpperCase()
            ? Object.values(roomsById)
                .find((entry) => entry.name === room.name)!
                .displayName.toUpperCase()
            : room.displayName}
        </text>
      ))}

      {/* windows on the outer walls */}
      <rect x="120" y={ROOM_TOP - 6} width="96" height="8" fill="#CFEAF6" stroke="#9DC4DA" strokeWidth="0.8" />
      <rect x="384" y={ROOM_TOP - 6} width="120" height="8" fill="#CFEAF6" stroke="#9DC4DA" strokeWidth="0.8" />
      <rect x="662" y={ROOM_TOP - 6} width="90" height="8" fill="#CFEAF6" stroke="#9DC4DA" strokeWidth="0.8" />
      <rect x="10" y="150" width="8" height="80" fill="#CFEAF6" stroke="#9DC4DA" strokeWidth="0.8" />
      <rect x="840" y="150" width="8" height="80" fill="#CFEAF6" stroke="#9DC4DA" strokeWidth="0.8" />

      {/* interior door openings between each room and the corridor */}
      {[214, 400, 672].map((doorX) => (
        <g key={doorX}>
          <rect x={doorX} y={ROOM_BOTTOM - 2} width="46" height="4" fill="#EFE3CB" />
          <path d={`M ${doorX} ${ROOM_BOTTOM} A 46 46 0 0 1 ${doorX + 46} ${ROOM_BOTTOM - 46}`} fill="none" stroke="#B9C0C8" strokeWidth="1.5" />
        </g>
      ))}

      {/* entry door at the bottom */}
      <rect x="428" y="566" width="60" height="6" fill="#EFE3CB" />
      <text x="392" y="548" fontSize="12.5" fontWeight="800" fill="#26313C">ENTRY</text>
      <path d="M 470 552 v-14 M 470 538 l-7 7 M 470 538 l7 7" fill="none" stroke="#7A8086" strokeWidth="2" strokeLinecap="round" />

      {/* water cooler + corridor plants */}
      <g transform="translate(792 468)">
        <rect x="0" y="18" width="22" height="40" rx="3" fill="#F3F6FA" stroke="#A9B7C6" />
        <rect x="2" y="30" width="18" height="18" rx="2" fill="#DCEAF7" />
        <rect x="6" y="0" width="11" height="22" rx="4" fill="#A8D4F5" stroke="#74A9D6" />
      </g>
      <Plant x={58} y={498} scale={0.95} />

      {/* legend (kept inside the corridor, clear of the entry) */}
      <g transform="translate(112 430)">
        <rect width="150" height="52" rx="10" fill="#FFFFFF" stroke="#E6EAED" />
        <text x="12" y="18" fontSize="11" fontWeight="800" fill="#26313C">LEGEND</text>
        <g transform="translate(22 36)">
          {[0, 120, 240].map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M0 -2 C 3 -7 4 -14 1 -18 C 0 -19 -2 -14 -2 -9 C -2 -5 -1 -3 0 -2 Z" fill="#5B3B1E" />
          ))}
          <circle r="3" fill="#432B12" />
        </g>
        <text x="38" y="40" fontSize="10.5" fontWeight="700" fill="#7A8086">Fan</text>
        <g transform="translate(92 32)">
          <circle r="9" fill="#FFF6D6" stroke="#D8BD72" />
          <circle r="5" fill="#FFC63A" />
        </g>
        <text x="106" y="36" fontSize="10.5" fontWeight="700" fill="#7A8086">Light</text>
      </g>

      {/* summary strip */}
      <g transform="translate(300 446)">
        <rect width="360" height="30" rx="9" fill="#FFFFFF" stroke="#E6EAED" />
        <text x="16" y="19" fontSize="10.5" fontWeight="800" fill="#26313C">
          3 Rooms · 2 Fans + 3 Lights each
        </text>
        <text x="212" y="19" fontSize="10.5" fontWeight="700" fill="#7A8086">
          {`${total} devices total`}
        </text>
      </g>
    </svg>
  );
}
