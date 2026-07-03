import type { RoomWithDevices, UsageSummary } from "@techathon/shared-types";

/*
 * These builders produce the friendly, conversational text the bot/dashboard use directly
 * when the LLM layer is unavailable (deterministic fallback). Every number is kept exact.
 * When GEMINI_API_KEY is set, this same text is handed to the model as the base to reword.
 */

const ROOM_LABELS: Record<string, string> = {
  drawing: "Drawing Room",
  work1: "Work Room 1",
  work2: "Work Room 2",
};

function prettyRoomName(name: string) {
  return ROOM_LABELS[name] ?? name;
}

// "A" | "A and B" | "A, B and C"
function joinNatural(items: string[]) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function buildStatusFacts(rooms: RoomWithDevices[]) {
  if (rooms.length === 0) {
    return "There aren't any rooms set up yet, so nothing's drawing power at the moment.";
  }

  const allDevices = rooms.flatMap((room) => room.devices);
  const devicesOn = allDevices.filter((device) => device.status === "on");

  if (devicesOn.length === 0) {
    return `Good news — everything's off across all ${allDevices.length} devices, so nothing's drawing power right now. 🌙`;
  }

  const clauses = rooms.map((room) => {
    const fansOn = room.devices.filter(
      (device) => device.type === "fan" && device.status === "on",
    ).length;
    const lightsOn = room.devices.filter(
      (device) => device.type === "light" && device.status === "on",
    ).length;

    const bits: string[] = [];
    if (fansOn > 0) {
      bits.push(`${fansOn} fan${fansOn === 1 ? "" : "s"}`);
    }
    if (lightsOn > 0) {
      bits.push(`${lightsOn} light${lightsOn === 1 ? "" : "s"}`);
    }

    if (bits.length === 0) {
      return `${room.displayName} is all off`;
    }
    return `${room.displayName} has ${joinNatural(bits)} on`;
  });

  return `Here's the office right now — ${joinNatural(clauses)}.`;
}

export function buildRoomFacts(room: RoomWithDevices | null) {
  if (!room) {
    return "Hmm, I couldn't find that room. Try Drawing Room, Work Room 1, or Work Room 2.";
  }

  const devicesOn = room.devices.filter((device) => device.status === "on");
  const devicesOff = room.devices.filter((device) => device.status !== "on");

  if (devicesOn.length === 0) {
    return `${room.displayName} is all quiet — every device is off, so nothing's drawing power there. 👍`;
  }

  const onNames = joinNatural(devicesOn.map((device) => device.name));
  let text = `${room.displayName} has ${devicesOn.length} device${
    devicesOn.length === 1 ? "" : "s"
  } on right now: ${onNames} ${devicesOn.length === 1 ? "is" : "are"} ON`;

  if (devicesOff.length > 0) {
    const offNames = joinNatural(devicesOff.map((device) => device.name));
    text += `, while ${offNames} ${devicesOff.length === 1 ? "is" : "are"} off`;
  }

  return `${text}.`;
}

export function buildUsageFacts(usage: UsageSummary) {
  const perRoom = Object.entries(usage.perRoomWatts)
    .map(([roomName, watts]) => `${prettyRoomName(roomName)} ${watts}W`)
    .join(", ");

  const base = `Right now the office is pulling ${usage.totalWattsNow}W in total, and we're at about ${usage.estimatedKwhToday} kWh for the day so far.`;

  return perRoom ? `${base} Room by room: ${perRoom}.` : base;
}
