import { prisma } from "@/lib/prisma";
import type { Prisma, Room } from "@prisma/client";

/**
 * Inventory/availability engine (calendar-based).
 *
 * Academic note:
 * - Classic OTA problem: preventing overbooking under concurrency.
 * - We solve it using a per-room, per-date inventory table (`RoomInventory`)
 *   and atomic SQL updates inside a Prisma transaction.
 */

export function toUtcDateOnly(d: Date): Date {
  // Chuẩn hóa thành ngày đơn thuần (00:00:00 UTC) để tất cả so sánh đều nhất quán
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function enumerateNights(checkIn: Date, checkOut: Date): Date[] {
  // Chúng ta xử lý booking như [checkIn, checkOut) đêm
  const start = toUtcDateOnly(checkIn);
  const end = toUtcDateOnly(checkOut);
  const nights: Date[] = [];
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    nights.push(new Date(d));
  }
  return nights;
}

export async function ensureRoomInventoryRows(
  tx: Prisma.TransactionClient,
  room: Pick<Room, "id" | "quantity">,
  nights: Date[],
) {
  if (nights.length === 0) return;

  // Tạo các dòng inventory còn thiếu (idempotent). Total mặc định là room.quantity hiện tại
  await tx.roomInventory.createMany({
    data: nights.map((date) => ({
      roomId: room.id,
      date,
      total: room.quantity,
      booked: 0,
    })),
    skipDuplicates: true,
  });
}

export async function ensureFutureInventoryCalendar(
  tx: Prisma.TransactionClient,
  room: Pick<Room, "id" | "quantity">,
  daysToGenerate: number,
) {
  // Tạo các dòng inventory cho N ngày tiếp theo (dùng cho admin tạo/cập nhật)
  const today = toUtcDateOnly(new Date());
  const dates: Date[] = [];
  for (let i = 0; i < daysToGenerate; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d);
  }

  await ensureRoomInventoryRows(tx, room, dates);

  // Giữ tổng số đồng bộ với room.quantity hiện tại cho các ngày tương lai
  await tx.roomInventory.updateMany({
    where: { roomId: room.id, date: { gte: today } },
    data: { total: room.quantity },
  });
}

export async function reserveRoomInventoryOrThrow(
  tx: Prisma.TransactionClient,
  roomId: string,
  nights: Date[],
) {
  /**
   * IMPORTANT:
   * We must be race-safe. `updateMany` cannot express "booked < total" because
   * it can't compare two columns. We use raw SQL with a guarded WHERE clause:
   *   UPDATE ... SET booked = booked + 1
   *   WHERE roomId = $1 AND date = $2 AND booked < total
   *
   * If any date fails to update, the room is sold out on at least one night.
   */
  for (const date of nights) {
    const updatedRows = await tx.$executeRaw`
      UPDATE "RoomInventory"
      SET "booked" = "booked" + 1, "updatedAt" = NOW()
      WHERE "roomId" = ${roomId}
        AND "date" = ${date}::date
        AND "booked" < "total"
    `;
    if (updatedRows !== 1) {
      throw new Error("ROOM_NOT_AVAILABLE");
    }
  }
}

export async function releaseRoomInventory(
  tx: Prisma.TransactionClient,
  roomId: string,
  nights: Date[],
) {
  // Giải phóng là best-effort nhưng không bao giờ được âm
  for (const date of nights) {
    await tx.$executeRaw`
      UPDATE "RoomInventory"
      SET "booked" = GREATEST("booked" - 1, 0), "updatedAt" = NOW()
      WHERE "roomId" = ${roomId}
        AND "date" = ${date}::date
    `;
  }
}

export async function getRoomAvailabilitySummary(roomId: string, checkIn: Date, checkOut: Date) {
  const nights = enumerateNights(checkIn, checkOut);
  if (nights.length === 0) return { available: false, remainingMin: 0 };

  // Lấy thông tin phòng
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true, quantity: true }
  });

  if (!room) return { available: false, remainingMin: 0 };

  // Tự động tạo inventory nếu chưa có (auto-seed)
  await prisma.$transaction(async (tx) => {
    await ensureRoomInventoryRows(tx, room, nights);
  });

  const rows = await prisma.roomInventory.findMany({
    where: {
      roomId,
      date: { gte: nights[0], lt: toUtcDateOnly(checkOut) },
    },
    select: { total: true, booked: true, date: true },
  });

  // Sau khi tạo, nếu vẫn thiếu thì có vấn đề
  if (rows.length !== nights.length) return { available: false, remainingMin: 0 };

  const remainingMin = rows.reduce((min, r) => Math.min(min, r.total - r.booked), Number.POSITIVE_INFINITY);
  return { available: remainingMin > 0, remainingMin: Math.max(0, remainingMin) };
}

