import type {
  Alert as SharedAlert,
  Device as SharedDevice,
  RoomWithDevices,
} from "@techathon/shared-types";
import type { Alert, Device, Room } from "@prisma/client";

export function serializeDevice(device: Device): SharedDevice {
  return {
    id: device.id,
    name: device.name,
    type: device.type as SharedDevice["type"],
    roomId: device.roomId,
    status: device.status as SharedDevice["status"],
    wattage: device.wattage,
    lastChangedAt: device.lastChangedAt.toISOString(),
  };
}

export function serializeAlert(alert: Alert): SharedAlert {
  return {
    id: alert.id,
    type: alert.type as SharedAlert["type"],
    roomId: alert.roomId,
    message: alert.message,
    createdAt: alert.createdAt.toISOString(),
    resolved: alert.resolved,
  };
}

export function serializeRoomWithDevices(
  room: Room & { devices: Device[] },
): RoomWithDevices {
  return {
    id: room.id,
    name: room.name,
    displayName: room.displayName,
    devices: room.devices.map(serializeDevice),
  };
}
