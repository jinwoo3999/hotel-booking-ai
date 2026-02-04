// Auto Room Holder - Tự động giữ phòng khi user xem
import { prisma } from '@/lib/prisma';
import { consentManager, AutoActionType } from './consent-manager';

export interface RoomHold {
  id: string;
  roomId: string;
  userId: string;
  heldAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'converted' | 'released';
}

export class AutoRoomHolder {
  private readonly HOLD_DURATION_MINUTES = 15;

  // Giữ phòng tự động
  async holdRoom(roomId: string, userId: string, duration?: number): Promise<RoomHold> {
    // Check consent
    const canHold = await consentManager.canAutoExecute(userId, AutoActionType.ROOM_HOLD);
    
    if (!canHold) {
      throw new Error('User has not enabled auto room hold');
    }

    const holdDuration = duration || this.HOLD_DURATION_MINUTES;
    const expiresAt = new Date(Date.now() + holdDuration * 60 * 1000);

    // Check if already holding this room
    const existingHold = await prisma.roomHold.findFirst({
      where: {
        roomId,
        userId,
        status: 'active',
        expiresAt: { gte: new Date() }
      }
    });

    if (existingHold) {
      // Extend existing hold
      const updated = await prisma.roomHold.update({
        where: { id: existingHold.id },
        data: { expiresAt }
      });

      return {
        id: updated.id,
        roomId: updated.roomId,
        userId: updated.userId,
        heldAt: updated.heldAt,
        expiresAt: updated.expiresAt,
        status: updated.status as any
      };
    }

    // Create new hold
    const hold = await prisma.roomHold.create({
      data: {
        roomId,
        userId,
        expiresAt,
        status: 'active'
      }
    });

    return {
      id: hold.id,
      roomId: hold.roomId,
      userId: hold.userId,
      heldAt: hold.heldAt,
      expiresAt: hold.expiresAt,
      status: hold.status as any
    };
  }

  // Release hold
  async releaseHold(holdId: string): Promise<void> {
    await prisma.roomHold.update({
      where: { id: holdId },
      data: { status: 'released' }
    });
  }

  // Convert hold to booking
  async convertHoldToBooking(holdId: string, bookingId: string): Promise<void> {
    await prisma.roomHold.update({
      where: { id: holdId },
      data: {
        status: 'converted',
        convertedToBookingId: bookingId
      }
    });
  }

  // Get active holds for user
  async getActiveHolds(userId: string): Promise<RoomHold[]> {
    const holds = await prisma.roomHold.findMany({
      where: {
        userId,
        status: 'active',
        expiresAt: { gte: new Date() }
      },
      orderBy: { expiresAt: 'asc' }
    });

    return holds.map(h => ({
      id: h.id,
      roomId: h.roomId,
      userId: h.userId,
      heldAt: h.heldAt,
      expiresAt: h.expiresAt,
      status: h.status as any
    }));
  }

  // Cleanup expired holds (run periodically)
  async cleanupExpiredHolds(): Promise<number> {
    const result = await prisma.roomHold.updateMany({
      where: {
        status: 'active',
        expiresAt: { lt: new Date() }
      },
      data: { status: 'expired' }
    });

    return result.count;
  }

  // Check if room is held by user
  async isRoomHeldByUser(roomId: string, userId: string): Promise<boolean> {
    const hold = await prisma.roomHold.findFirst({
      where: {
        roomId,
        userId,
        status: 'active',
        expiresAt: { gte: new Date() }
      }
    });

    return !!hold;
  }
}

export const autoRoomHolder = new AutoRoomHolder();
