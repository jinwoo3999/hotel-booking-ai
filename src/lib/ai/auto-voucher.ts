// Auto Voucher Applier - Tự động tìm và áp dụng voucher tốt nhất
import { prisma } from '@/lib/prisma';

export interface VoucherApplication {
  voucher: any;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  saved: number;
}

export class AutoVoucherApplier {
  // Tìm voucher tốt nhất cho booking
  async findBestVoucher(bookingRequest: {
    userId: string;
    totalPrice: number;
    hotelId?: string;
    roomId?: string;
  }): Promise<any | null> {
    // Get all valid vouchers
    const vouchers = await prisma.voucher.findMany({
      where: {
        endDate: { gte: new Date() },
        usedCount: { lt: prisma.voucher.fields.usageLimit }
      }
    });

    let bestVoucher: any = null;
    let maxDiscount = 0;

    for (const voucher of vouchers) {
      // Check min spend
      if (voucher.minSpend && bookingRequest.totalPrice < voucher.minSpend) {
        continue;
      }

      // Calculate discount
      let discount = 0;
      if (voucher.type === 'PERCENT') {
        discount = (bookingRequest.totalPrice * voucher.discount) / 100;
      } else {
        discount = voucher.discount;
      }

      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestVoucher = voucher;
      }
    }

    return bestVoucher;
  }

  // Apply voucher to booking
  async applyVoucher(bookingId: string, voucherId: string): Promise<VoucherApplication> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId }
    });

    if (!voucher) {
      throw new Error('Voucher not found');
    }

    // Validate voucher
    if (voucher.endDate < new Date()) {
      throw new Error('Voucher đã hết hạn');
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      throw new Error('Voucher đã hết lượt sử dụng');
    }

    if (voucher.minSpend && booking.originalPrice < voucher.minSpend) {
      throw new Error(`Đơn hàng phải tối thiểu ${voucher.minSpend.toLocaleString()}đ`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.type === 'PERCENT') {
      discountAmount = (booking.originalPrice * voucher.discount) / 100;
    } else {
      discountAmount = voucher.discount;
    }

    const finalPrice = Math.max(0, booking.originalPrice - discountAmount);

    // Update booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        voucherId,
        discount: discountAmount,
        totalPrice: finalPrice
      }
    });

    // Update voucher usage
    await prisma.voucher.update({
      where: { id: voucherId },
      data: {
        usedCount: { increment: 1 }
      }
    });

    return {
      voucher,
      originalPrice: booking.originalPrice,
      discountAmount,
      finalPrice,
      saved: discountAmount
    };
  }

  // Auto apply best voucher
  async autoApplyBest(bookingId: string): Promise<VoucherApplication | null> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const bestVoucher = await this.findBestVoucher({
      userId: booking.userId,
      totalPrice: booking.originalPrice,
      hotelId: booking.hotelId,
      roomId: booking.roomId
    });

    if (!bestVoucher) {
      return null;
    }

    return await this.applyVoucher(bookingId, bestVoucher.id);
  }

  // Get available vouchers for user
  async getAvailableVouchers(userId: string, totalPrice: number): Promise<any[]> {
    const vouchers = await prisma.voucher.findMany({
      where: {
        endDate: { gte: new Date() },
        usedCount: { lt: prisma.voucher.fields.usageLimit },
        OR: [
          { minSpend: null },
          { minSpend: { lte: totalPrice } }
        ]
      },
      orderBy: { discount: 'desc' }
    });

    return vouchers.map(v => ({
      ...v,
      estimatedDiscount: v.type === 'PERCENT' 
        ? (totalPrice * v.discount) / 100 
        : v.discount
    }));
  }

  // Calculate savings with voucher
  calculateSavings(originalPrice: number, voucher: any): number {
    if (voucher.type === 'PERCENT') {
      return (originalPrice * voucher.discount) / 100;
    }
    return voucher.discount;
  }
}

export const autoVoucherApplier = new AutoVoucherApplier();
