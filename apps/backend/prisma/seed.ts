import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roomDefinitions = [
  { name: "drawing", displayName: "Drawing Room" },
  { name: "work1", displayName: "Work Room 1" },
  { name: "work2", displayName: "Work Room 2" },
] as const;

async function main() {
  let fanCount = 0;
  let lightCount = 0;

  for (const roomDefinition of roomDefinitions) {
    const room = await prisma.room.upsert({
      where: { name: roomDefinition.name },
      update: { displayName: roomDefinition.displayName },
      create: roomDefinition,
    });

    for (const name of ["Fan 1", "Fan 2"]) {
      fanCount += 1;
      await prisma.device.upsert({
        where: {
          roomId_name: {
            roomId: room.id,
            name,
          },
        },
        update: {
          type: "fan",
          status: "off",
          wattage: 60,
          lastChangedAt: new Date(),
        },
        create: {
          roomId: room.id,
          name,
          type: "fan",
          status: "off",
          wattage: 60,
          lastChangedAt: new Date(),
        },
      });
    }

    for (const name of ["Light 1", "Light 2", "Light 3"]) {
      lightCount += 1;
      await prisma.device.upsert({
        where: {
          roomId_name: {
            roomId: room.id,
            name,
          },
        },
        update: {
          type: "light",
          status: "off",
          wattage: 15,
          lastChangedAt: new Date(),
        },
        create: {
          roomId: room.id,
          name,
          type: "light",
          status: "off",
          wattage: 15,
          lastChangedAt: new Date(),
        },
      });
    }
  }

  const totalRooms = await prisma.room.count();
  const totalDevices = await prisma.device.count();

  console.log(
    `Seeded ${totalRooms} rooms, ${totalDevices} devices, ${fanCount} fans, ${lightCount} lights.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
