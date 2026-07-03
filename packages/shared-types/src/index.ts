export interface Room {
  id: string;
  name: string;
  displayName: string;
}

export interface RoomWithDevices extends Room {
  devices: Device[];
}

export interface Device {
  id: string;
  name: string;
  type: "fan" | "light";
  roomId: string;
  status: "on" | "off";
  wattage: number;
  lastChangedAt: string;
}

export interface Alert {
  id: string;
  type: "after_hours" | "continuous_run";
  roomId: string;
  message: string;
  createdAt: string;
  resolved: boolean;
}

export interface UsageSummary {
  totalWattsNow: number;
  perRoomWatts: Record<string, number>;
  estimatedKwhToday: number;
}

export interface HumanizedResponse {
  text: string;
  source: "ai" | "fallback";
}
