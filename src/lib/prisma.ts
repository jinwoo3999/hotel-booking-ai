import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Bật log để xem SQL chạy thế nào (chỉ hiện ở dev)
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;