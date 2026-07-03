export interface DeviceDataSource {
  /*
   * This interface lets us swap the current simulator for a future MQTT-backed ESP32 integration
   * without changing the alert engine, REST routes, or Socket.IO broadcasting layer. The rest of
   * the backend only cares that a data source can start pushing device changes through one callback.
   */
  start(onDeviceChange: (deviceId: string, status: "on" | "off") => Promise<void>): void;
}
