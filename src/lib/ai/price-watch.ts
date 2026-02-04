// Price Watch - Theo dõi giá và alert
import { prisma } from '@/lib/prisma';
import { proactiveSuggestionEngine } from './proactive-suggestion';

export interface PriceWatch {
  id: string;
  userId: string;
  hotelId: string;
  targetPrice?: number;
  alertOnAnyDrop: boolean;
  minDropPercent: number;
  lastKnownPrice: number;
  active: boolean;
}

export class PriceWatchService {
  // Tạo price watch
  async createWatch(userId: string, hotelId: string, options?: {
    targetPrice?: number;
    alertOnAnyDrop?: boolean;
    minDropPercent?: number;
  }): Promise<PriceWatch> {
    // Get current price
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        rooms: {
          orderBy: { price: 'asc' },
          take: 1
        }
      }
    });

    if (!hotel || hotel.rooms.length === 0) {
      throw new Error('Hotel or rooms not found');
    }

    const currentPrice = hotel.rooms[0].price;

    const watch = await prisma.priceWatch.create({
      data: {
        userId,
        hotelId,
        targetPrice: options?.targetPrice,
        alertOnAnyDrop: options?.alertOnAnyDrop ?? true,
        minDropPercent: options?.minDropPercent ?? 10,
        lastKnownPrice: currentPrice,
        active: true
      }
    });

    return {
      id: watch.id,
      userId: watch.userId,
      hotelId: watch.hotelId,
      targetPrice: watch.targetPrice || undefined,
      alertOnAnyDrop: watch.alertOnAnyDrop,
      minDropPercent: watch.minDropPercent,
      lastKnownPrice: watch.lastKnownPrice,
      active: watch.active
    };
  }

  // Check prices và gửi alerts
  async checkPrices(): Promise<number> {
    const watches = await prisma.priceWatch.findMany({
      where: { active: true },
      include: {
        hotel: {
          include: {
            rooms: {
              orderBy: { price: 'asc' },
              take: 1
            }
          }
        }
      }
    });

    let alertsSent = 0;

    for (const watch of watches) {
      if (watch.hotel.rooms.length === 0) continue;

      const currentPrice = watch.hotel.rooms[0].price;
      const priceDrop = watch.lastKnownPrice - currentPrice;
      const dropPercent = (priceDrop / watch.lastKnownPrice) * 100;

      let shouldAlert = false;
      let alertMessage = '';

      // Check target price
      if (watch.targetPrice && currentPrice <= watch.targetPrice) {
        shouldAlert = true;
        alertMessage = `🎯 Giá ${watch.hotel.name} đã đạt mục tiêu! ${currentPrice.toLocaleString()}đ (mục tiêu: ${watch.targetPrice.toLocaleString()}đ)`;
      }
      // Check drop percent
      else if (watch.alertOnAnyDrop && dropPercent >= watch.minDropPercent) {
        shouldAlert = true;
        alertMessage = `📉 Giá ${watch.hotel.name} giảm ${dropPercent.toFixed(0)}%! Từ ${watch.lastKnownPrice.toLocaleString()}đ xuống ${currentPrice.toLocaleString()}đ`;
      }

      if (shouldAlert) {
        // Create proactive suggestion
        await proactiveSuggestionEngine.createSuggestion(watch.userId, {
          type: 'price_drop',
          priority: 'high',
          message: alertMessage,
          action: {
            type: 'book',
            data: { hotelId: watch.hotelId }
          },
          reasoning: `Price dropped from ${watch.lastKnownPrice} to ${currentPrice}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        // Update watch
        await prisma.priceWatch.update({
          where: { id: watch.id },
          data: {
            lastKnownPrice: currentPrice,
            lastChecked: new Date(),
            alertsSent: { increment: 1 },
            lastAlertSent: new Date()
          }
        });

        alertsSent++;
      } else if (currentPrice !== watch.lastKnownPrice) {
        // Just update price without alert
        await prisma.priceWatch.update({
          where: { id: watch.id },
          data: {
            lastKnownPrice: currentPrice,
            lastChecked: new Date()
          }
        });
      }
    }

    return alertsSent;
  }

  // Get watches for user
  async getUserWatches(userId: string): Promise<PriceWatch[]> {
    const watches = await prisma.priceWatch.findMany({
      where: { userId, active: true }
    });

    return watches.map(w => ({
      id: w.id,
      userId: w.userId,
      hotelId: w.hotelId,
      targetPrice: w.targetPrice || undefined,
      alertOnAnyDrop: w.alertOnAnyDrop,
      minDropPercent: w.minDropPercent,
      lastKnownPrice: w.lastKnownPrice,
      active: w.active
    }));
  }

  // Deactivate watch
  async deactivateWatch(watchId: string): Promise<void> {
    await prisma.priceWatch.update({
      where: { id: watchId },
      data: { active: false }
    });
  }

  // Record price history
  async recordPriceHistory(roomId: string, date: Date, price: number): Promise<void> {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Simple holiday check (can be enhanced)
    const isHoliday = false;
    
    // Seasonal flag (can be enhanced with more logic)
    const month = date.getMonth() + 1;
    let seasonalFlag = 'off-peak';
    if ([6, 7, 8, 12].includes(month)) {
      seasonalFlag = 'peak';
    } else if ([4, 5, 9, 10].includes(month)) {
      seasonalFlag = 'shoulder';
    }

    await prisma.priceHistory.upsert({
      where: {
        roomId_date: {
          roomId,
          date
        }
      },
      create: {
        roomId,
        date,
        price,
        dayOfWeek,
        isWeekend,
        isHoliday,
        seasonalFlag
      },
      update: {
        price,
        dayOfWeek,
        isWeekend,
        isHoliday,
        seasonalFlag
      }
    });
  }

  // Get price trend
  async getPriceTrend(roomId: string, days: number = 30): Promise<{
    current: number;
    average: number;
    min: number;
    max: number;
    trend: 'up' | 'down' | 'stable';
    prediction: string;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await prisma.priceHistory.findMany({
      where: {
        roomId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    if (history.length === 0) {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      return {
        current: room?.price || 0,
        average: room?.price || 0,
        min: room?.price || 0,
        max: room?.price || 0,
        trend: 'stable',
        prediction: 'Chưa có đủ dữ liệu để dự đoán'
      };
    }

    const prices = history.map(h => h.price);
    const current = prices[prices.length - 1];
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // Simple trend detection
    const recentPrices = prices.slice(-7); // Last 7 days
    const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const olderPrices = prices.slice(0, -7);
    const olderAvg = olderPrices.length > 0 
      ? olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length 
      : recentAvg;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.05) trend = 'up';
    else if (recentAvg < olderAvg * 0.95) trend = 'down';

    // Simple prediction
    let prediction = '';
    if (trend === 'up') {
      prediction = 'Giá đang tăng. Nên đặt sớm để tránh tăng giá thêm.';
    } else if (trend === 'down') {
      prediction = 'Giá đang giảm. Có thể đợi thêm vài ngày để có giá tốt hơn.';
    } else {
      if (current < average * 0.9) {
        prediction = 'Giá hiện tại thấp hơn trung bình 10%. Đây là thời điểm tốt để đặt!';
      } else if (current > average * 1.1) {
        prediction = 'Giá hiện tại cao hơn trung bình 10%. Nên đợi giá giảm.';
      } else {
        prediction = 'Giá ổn định. Có thể đặt bất cứ lúc nào.';
      }
    }

    return {
      current,
      average: Math.round(average),
      min,
      max,
      trend,
      prediction
    };
  }
}

export const priceWatchService = new PriceWatchService();
