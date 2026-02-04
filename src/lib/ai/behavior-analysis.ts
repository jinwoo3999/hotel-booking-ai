// Behavior Analysis Engine - Phân tích hành vi và dự đoán
import { prisma } from '@/lib/prisma';

export interface BehaviorPattern {
  userId: string;
  bookingsPerYear: number;
  lastBookingDate: Date | null;
  favoriteDestinations: DestinationPattern[];
  avgBookingLeadTime: number;
  avgStayDuration: number;
  avgPricePerNight: number;
  preferredHotelTypes: string[];
  preferredAmenities: string[];
  viewingBehavior: ViewingBehavior;
  predictionScores: PredictionScores;
}

export interface DestinationPattern {
  location: string;
  visitCount: number;
  lastVisit: Date;
  typicalMonths: number[];
  typicalDuration: number;
}

export interface ViewingBehavior {
  avgTimeOnHotel: number;
  hotelsViewedPerBooking: number;
  viewingToBookingRate: number;
}

export interface PredictionScores {
  priceSensitivity: number; // 0-1
  impulseBuyer: number; // 0-1
  plannerType: number; // 0-1
}

export interface PredictedAction {
  action: 'book_soon' | 'price_sensitive' | 'needs_suggestion' | 'ready_to_book';
  confidence: number;
  reasoning: string;
  suggestedResponse: string;
}

export interface ProactiveTrigger {
  type: 'seasonal_reminder' | 'price_drop' | 'low_inventory' | 'deal_alert';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action?: any;
}

export class BehaviorAnalysisEngine {
  // Phân tích pattern từ booking history
  async analyzePattern(userId: string): Promise<BehaviorPattern> {
    // 1. Lấy booking history
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        hotel: true,
        room: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Lấy interaction history
    const interactions = await prisma.userInteraction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // 3. Tính toán metrics
    const bookingsPerYear = this.calculateBookingsPerYear(bookings);
    const lastBookingDate = bookings[0]?.createdAt || null;
    const favoriteDestinations = this.analyzeFavoriteDestinations(bookings);
    const avgBookingLeadTime = this.calculateAvgLeadTime(bookings);
    const avgStayDuration = this.calculateAvgStayDuration(bookings);
    const avgPricePerNight = this.calculateAvgPrice(bookings);
    const preferredHotelTypes = this.analyzeHotelTypes(bookings);
    const preferredAmenities = this.analyzeAmenities(bookings);
    const viewingBehavior = this.analyzeViewingBehavior(interactions, bookings);
    const predictionScores = this.calculatePredictionScores(bookings, interactions);

    return {
      userId,
      bookingsPerYear,
      lastBookingDate,
      favoriteDestinations,
      avgBookingLeadTime,
      avgStayDuration,
      avgPricePerNight,
      preferredHotelTypes,
      preferredAmenities,
      viewingBehavior,
      predictionScores
    };
  }

  // Dự đoán hành động tiếp theo
  async predictNextAction(userId: string, currentContext: any): Promise<PredictedAction> {
    const pattern = await this.analyzePattern(userId);

    // Nếu user đang xem nhiều hotels
    if (currentContext.hotelsViewed > 3) {
      if (pattern.predictionScores.impulseBuyer > 0.7) {
        return {
          action: 'ready_to_book',
          confidence: 0.85,
          reasoning: 'User có xu hướng đặt nhanh và đã xem nhiều khách sạn',
          suggestedResponse: 'Tôi thấy bạn đang xem nhiều khách sạn. Cho tôi tự động đặt phòng tốt nhất cho bạn?'
        };
      } else if (pattern.predictionScores.priceSensitivity > 0.7) {
        return {
          action: 'price_sensitive',
          confidence: 0.8,
          reasoning: 'User quan tâm giá, đang so sánh nhiều options',
          suggestedResponse: 'Tôi có thể tìm deal tốt nhất cho bạn. Bạn muốn tôi theo dõi giá và báo khi giảm?'
        };
      }
    }

    // Nếu đến mùa user thường đi du lịch
    const currentMonth = new Date().getMonth() + 1;
    const hasSeasonalPattern = pattern.favoriteDestinations.some(dest => 
      dest.typicalMonths.includes(currentMonth)
    );

    if (hasSeasonalPattern && pattern.bookingsPerYear > 2) {
      return {
        action: 'needs_suggestion',
        confidence: 0.75,
        reasoning: 'Đến mùa user thường đi du lịch',
        suggestedResponse: 'Bạn thường đi du lịch vào tháng này. Tôi đã tìm được vài deal tốt, muốn xem không?'
      };
    }

    return {
      action: 'book_soon',
      confidence: 0.5,
      reasoning: 'Chưa có pattern rõ ràng',
      suggestedResponse: ''
    };
  }

  // Kiểm tra xem có nên trigger proactive suggestion không
  async shouldTriggerProactive(userId: string): Promise<ProactiveTrigger[]> {
    const pattern = await this.analyzePattern(userId);
    const triggers: ProactiveTrigger[] = [];

    // 1. Seasonal reminder
    const currentMonth = new Date().getMonth() + 1;
    for (const dest of pattern.favoriteDestinations) {
      // Nếu user thường đi vào tháng sau
      const nextMonth = (currentMonth % 12) + 1;
      if (dest.typicalMonths.includes(nextMonth) && dest.visitCount >= 2) {
        triggers.push({
          type: 'seasonal_reminder',
          priority: 'high',
          message: `Bạn thường đi ${dest.location} vào tháng ${nextMonth}. Muốn tôi tìm khách sạn sớm để có giá tốt?`,
          action: {
            type: 'search',
            location: dest.location
          }
        });
      }
    }

    // 2. Check price drops for watched hotels
    const priceWatches = await prisma.priceWatch.findMany({
      where: {
        userId,
        active: true
      },
      include: {
        hotel: {
          include: {
            rooms: true
          }
        }
      }
    });

    for (const watch of priceWatches) {
      const currentPrice = watch.hotel.rooms[0]?.price || 0;
      const dropPercent = ((watch.lastKnownPrice - currentPrice) / watch.lastKnownPrice) * 100;

      if (dropPercent >= watch.minDropPercent) {
        triggers.push({
          type: 'price_drop',
          priority: 'high',
          message: `Giá ${watch.hotel.name} giảm ${dropPercent.toFixed(0)}%! Từ ${watch.lastKnownPrice.toLocaleString()}đ xuống ${currentPrice.toLocaleString()}đ. Đặt ngay?`,
          action: {
            type: 'book',
            hotelId: watch.hotelId
          }
        });
      }
    }

    return triggers;
  }

  // Track user interaction
  async trackInteraction(userId: string, interaction: {
    type: string;
    entityType?: string;
    entityId?: string;
    duration?: number;
    metadata?: any;
  }): Promise<void> {
    await prisma.userInteraction.create({
      data: {
        userId,
        interactionType: interaction.type,
        entityType: interaction.entityType,
        entityId: interaction.entityId,
        duration: interaction.duration,
        metadata: interaction.metadata
      }
    });

    // Update behavior pattern asynchronously
    this.updateBehaviorPattern(userId).catch(console.error);
  }

  // Update behavior pattern in database
  async updateBehaviorPattern(userId: string): Promise<void> {
    const pattern = await this.analyzePattern(userId);

    await prisma.behaviorPattern.upsert({
      where: { userId },
      create: {
        userId,
        bookingsPerYear: pattern.bookingsPerYear,
        lastBookingDate: pattern.lastBookingDate,
        favoriteDestinations: pattern.favoriteDestinations as any,
        avgBookingLeadTime: pattern.avgBookingLeadTime,
        avgStayDuration: pattern.avgStayDuration,
        avgPricePerNight: pattern.avgPricePerNight,
        preferredHotelTypes: pattern.preferredHotelTypes,
        preferredAmenities: pattern.preferredAmenities,
        avgTimeOnHotel: pattern.viewingBehavior.avgTimeOnHotel,
        hotelsViewedPerBooking: pattern.viewingBehavior.hotelsViewedPerBooking,
        viewingToBookingRate: pattern.viewingBehavior.viewingToBookingRate,
        priceSensitivity: pattern.predictionScores.priceSensitivity,
        impulseBuyer: pattern.predictionScores.impulseBuyer,
        plannerType: pattern.predictionScores.plannerType
      },
      update: {
        bookingsPerYear: pattern.bookingsPerYear,
        lastBookingDate: pattern.lastBookingDate,
        favoriteDestinations: pattern.favoriteDestinations as any,
        avgBookingLeadTime: pattern.avgBookingLeadTime,
        avgStayDuration: pattern.avgStayDuration,
        avgPricePerNight: pattern.avgPricePerNight,
        preferredHotelTypes: pattern.preferredHotelTypes,
        preferredAmenities: pattern.preferredAmenities,
        avgTimeOnHotel: pattern.viewingBehavior.avgTimeOnHotel,
        hotelsViewedPerBooking: pattern.viewingBehavior.hotelsViewedPerBooking,
        viewingToBookingRate: pattern.viewingBehavior.viewingToBookingRate,
        priceSensitivity: pattern.predictionScores.priceSensitivity,
        impulseBuyer: pattern.predictionScores.impulseBuyer,
        plannerType: pattern.predictionScores.plannerType
      }
    });
  }

  // Helper methods
  private calculateBookingsPerYear(bookings: any[]): number {
    if (bookings.length === 0) return 0;

    const firstBooking = bookings[bookings.length - 1].createdAt;
    const lastBooking = bookings[0].createdAt;
    const daysDiff = (lastBooking.getTime() - firstBooking.getTime()) / (1000 * 60 * 60 * 24);
    const yearsDiff = daysDiff / 365;

    return yearsDiff > 0 ? bookings.length / yearsDiff : bookings.length;
  }

  private analyzeFavoriteDestinations(bookings: any[]): DestinationPattern[] {
    const destMap = new Map<string, any>();

    for (const booking of bookings) {
      const city = booking.hotel.city;
      if (!destMap.has(city)) {
        destMap.set(city, {
          location: city,
          visitCount: 0,
          lastVisit: booking.createdAt,
          months: [],
          durations: []
        });
      }

      const dest = destMap.get(city);
      dest.visitCount++;
      dest.lastVisit = booking.createdAt;
      dest.months.push(booking.createdAt.getMonth() + 1);
      
      const nights = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      dest.durations.push(nights);
    }

    return Array.from(destMap.values())
      .map(dest => ({
        location: dest.location,
        visitCount: dest.visitCount,
        lastVisit: dest.lastVisit,
        typicalMonths: [...new Set(dest.months)] as number[],
        typicalDuration: Math.round(dest.durations.reduce((a: number, b: number) => a + b, 0) / dest.durations.length)
      }))
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 5);
  }

  private calculateAvgLeadTime(bookings: any[]): number {
    if (bookings.length === 0) return 14;

    const leadTimes = bookings.map(b => {
      const daysDiff = (b.checkIn.getTime() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return Math.max(0, daysDiff);
    });

    return Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length);
  }

  private calculateAvgStayDuration(bookings: any[]): number {
    if (bookings.length === 0) return 2;

    const durations = bookings.map(b => {
      return Math.ceil((b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 60 * 60 * 24));
    });

    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }

  private calculateAvgPrice(bookings: any[]): number {
    if (bookings.length === 0) return 0;

    const prices = bookings.map(b => {
      const nights = Math.ceil((b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return b.totalPrice / nights;
    });

    return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  }

  private analyzeHotelTypes(bookings: any[]): string[] {
    // Phân loại dựa trên giá và rating
    const types = bookings.map(b => {
      const pricePerNight = b.totalPrice / Math.ceil((b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (pricePerNight > 3000000) return 'luxury';
      if (pricePerNight > 1500000) return 'resort';
      if (pricePerNight > 800000) return 'business';
      return 'budget';
    });

    const typeCounts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type);
  }

  private analyzeAmenities(bookings: any[]): string[] {
    const amenityCounts = new Map<string, number>();

    for (const booking of bookings) {
      for (const amenity of booking.room.amenities || []) {
        amenityCounts.set(amenity, (amenityCounts.get(amenity) || 0) + 1);
      }
    }

    return Array.from(amenityCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([amenity]) => amenity);
  }

  private analyzeViewingBehavior(interactions: any[], bookings: any[]): ViewingBehavior {
    const viewInteractions = interactions.filter(i => i.interactionType === 'view' && i.entityType === 'hotel');
    
    const avgTimeOnHotel = viewInteractions.length > 0
      ? Math.round(viewInteractions.reduce((sum, i) => sum + (i.duration || 0), 0) / viewInteractions.length)
      : 0;

    const hotelsViewedPerBooking = bookings.length > 0
      ? Math.round(viewInteractions.length / bookings.length)
      : 5;

    const viewingToBookingRate = viewInteractions.length > 0
      ? bookings.length / viewInteractions.length
      : 0.2;

    return {
      avgTimeOnHotel,
      hotelsViewedPerBooking,
      viewingToBookingRate
    };
  }

  private calculatePredictionScores(bookings: any[], interactions: any[]): PredictionScores {
    // Price sensitivity: Dựa trên variance của giá đặt
    const prices = bookings.map(b => b.totalPrice);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / (prices.length || 1);
    const priceSensitivity = Math.min(1, variance / (avgPrice * avgPrice));

    // Impulse buyer: Dựa trên lead time
    const leadTimes = bookings.map(b => 
      (b.checkIn.getTime() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgLeadTime = leadTimes.reduce((a, b) => a + b, 0) / (leadTimes.length || 1);
    const impulseBuyer = Math.max(0, 1 - (avgLeadTime / 30)); // 0 days = 1.0, 30+ days = 0

    // Planner type: Dựa trên lead time và số lần xem
    const viewsPerBooking = interactions.filter(i => i.interactionType === 'view').length / (bookings.length || 1);
    const plannerType = Math.min(1, (avgLeadTime / 30) * (viewsPerBooking / 10));

    return {
      priceSensitivity: Math.round(priceSensitivity * 100) / 100,
      impulseBuyer: Math.round(impulseBuyer * 100) / 100,
      plannerType: Math.round(plannerType * 100) / 100
    };
  }
}

export const behaviorAnalysisEngine = new BehaviorAnalysisEngine();
