import type { RoomWithDevices, UsageSummary } from "@techathon/shared-types";

export function buildStatusFacts(rooms: RoomWithDevices[]) {
  if (rooms.length === 0) {
    return "No rooms are configured yet. No power is being drawn.";
  }

  const allDevices = rooms.flatMap((room) => room.devices);
  const devicesOn = allDevices.filter((device) => device.status === "on");

  if (devicesOn.length === 0) {
    return `All ${allDevices.length} devices are currently off. No power is being drawn.`;
  }

  return rooms
    .map((room) => {
      const fansOn = room.devices.filter(
        (device) => device.type === "fan" && device.status === "on",
      ).length;
      const lightsOn = room.devices.filter(
        (device) => device.type === "light" && device.status === "on",
      ).length;

      if (fansOn === 0 && lightsOn === 0) {
        return `${room.displayName}: all off.`;
      }

      return `${room.displayName}: ${fansOn} fan${fansOn === 1 ? "" : "s"} ON, ${lightsOn} light${lightsOn === 1 ? "" : "s"} ON.`;
    })
    .join(" ");
}

export function buildRoomFacts(room: RoomWithDevices | null) {
  if (!room) {
    return "That room doesn't exist. Valid rooms are: Drawing Room, Work Room 1, Work Room 2.";
  }

  const devicesOn = room.devices.filter((device) => device.status === "on");

  if (devicesOn.length === 0) {
    return `${room.displayName} is fully off right now. No devices are drawing power there.`;
  }

  const deviceSummaries = room.devices.map((device) => {
    return `${device.name} is ${device.status.toUpperCase()}`;
  });

  return `${room.displayName} currently has ${devicesOn.length} device${devicesOn.length === 1 ? "" : "s"} on. ${deviceSummaries.join(", ")}.`;
}

export function buildUsageFacts(usage: UsageSummary) {
  const perRoomText = Object.entries(usage.perRoomWatts)
    .map(([roomName, watts]) => `${roomName} is using ${watts}W`)
    .join(". ");

  return `Total power right now: ${usage.totalWattsNow}W. Today's estimated usage: ${usage.estimatedKwhToday} kWh. ${perRoomText}.`;
}
