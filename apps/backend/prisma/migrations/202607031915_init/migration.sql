CREATE TABLE IF NOT EXISTS "Room" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "displayName" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Room_name_key" ON "Room"("name");

CREATE TABLE IF NOT EXISTS "Device" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'off',
  "wattage" INTEGER NOT NULL,
  "lastChangedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Device_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Device_roomId_name_key" ON "Device"("roomId", "name");
CREATE INDEX IF NOT EXISTS "Device_roomId_idx" ON "Device"("roomId");

CREATE TABLE IF NOT EXISTS "Alert" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "deviceId" TEXT,
  "message" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Alert_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Alert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Alert_roomId_idx" ON "Alert"("roomId");
CREATE INDEX IF NOT EXISTS "Alert_deviceId_idx" ON "Alert"("deviceId");
