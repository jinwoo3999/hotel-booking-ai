// Instant Booking Service - Đặt phòng tự động ngay lập tức
import { prisma } from '@/lib/prisma';
import { getRoomAvailabilitySummary } from '@/lib/inventory';
import { autoVoucherApplier } from './auto-voucher';

export interface InstantBookingRequest {
  userId: string;
  location: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  autoSelect: boolean;
  maxPrice?: number;
}

export interface BookingResult {
  success: boolean;
  booking?: any;
  hotel: any;
  room: any;
  totalPrice: number;
  appliedVouchers: any[];
  executionTime: number;
  explanation: string;
}

export interface UserProfile {
  avgPrice: number;
  preferredAmenities: string[];
  favoriteLocations: string[];
}

export class InstantBookingService {
  async bookInstantly(request: InstantBookingRequest): Promise<BookingResult> {
    const startTime = Date.now();
    
    try {
      // 1. Tìm phòng tốt nhất
      const userProfile = await this.getUserProfile(request.userId);
      const bestRoom = await this.findBestRoom(request, userProfile);
      
      if (!bestRoom) {
        return {
          success: false,
          hotel: null,
          room: null,
          totalPrice: 0,
          appliedVouchers: [],
          executionTime: Date.now() - startTime,
          explanation: 'Không tìm thấy phòng phù hợp trong khoảng thời gian này'
        };
      }
      
      // 2. Kiểm tra availability
      const availability = await getRoomAvailabilitySummary(
        bestRoom.id,
        request.checkIn,
        request.checkOut
      );
      
      if (!availability.available || availability.remainingMin <= 0) {
        return {
          success: false,
          hotel: bestRoom.hotel,
          room: bestRoom,
          totalPrice: 0,
          appliedVouchers: [],
          executionTime: Date.now() - startTime,
          explanation: 'Phòng đã hết trong khoảng thời gian này'
        };
      }
      
      // 3. Tính giá
      const nights = Math.ceil((request.checkOut.getTime() - request.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      let totalPrice = bestRoom.price * nights;
      
      // 4. Tạo booking
      const booking = await prisma.booking.create({
        data: {
          userId: request.userId,
          hotelId: bestRoom.hotelId,
          roomId: bestRoom.id,
          checkIn: request.checkIn,
          checkOut: request.checkOut,
          originalPrice: totalPrice,
          totalPrice: totalPrice,
          status: 'PENDING',
          guestName: '',
          guestPhone: '',
          note: 'Tạo tự động bởi AI Operator'
        },
        include: {
          hotel: true,
          room: true
        }
      });
      
      // 5. Auto-apply best voucher
      let appliedVouchers: any[] = [];
      try {
        const voucherResult = await autoVoucherApplier.autoApplyBest(booking.id);
        if (voucherResult) {
          appliedVouchers.push(voucherResult.voucher);
          totalPrice = voucherResult.finalPrice;
        }
      } catch (error) {
        console.error('Auto voucher apply failed:', error);
        // Continue without voucher
      }
      
      // 6. Log action
      await prisma.autoActionLog.create({
        data: {
          userId: request.userId,
          actionType: 'instant_booking',
          status: 'completed',
          actionData: {
            location: request.location,
            checkIn: request.checkIn,
            checkOut: request.checkOut,
            guestCount: request.guestCount
          },
          result: {
            bookingId: booking.id,
            hotelName: bestRoom.hotel.name,
            roomName: bestRoom.name,
            totalPrice
          },
          executionTime: Date.now() - startTime
        }
      });
      
      return {
        success: true,
        booking,
        hotel: bestRoom.hotel,
        room: bestRoom,
        totalPrice,
        appliedVouchers,
        executionTime: Date.now() - startTime,
        explanation: `Đã tự động đặt phòng ${bestRoom.name} tại ${bestRoom.hotel.name}${appliedVouchers.length > 0 ? ` và áp dụng voucher ${appliedVouchers[0].code}` : ''}`
      };
      
    } catch (error) {
      console.error('Instant booking error:', error);
      
      await prisma.autoActionLog.create({
        data: {
          userId: request.userId,
          actionType: 'instant_booking',
          status: 'failed',
          actionData: JSON.parse(JSON.stringify(request)),
          result: { error: error instanceof Error ? error.message : 'Unknown error' },
          executionTime: Date.now() - startTime
        }
      });
      
      return {
        success: false,
        hotel: null,
        room: null,
        totalPrice: 0,
        appliedVouchers: [],
        executionTime: Date.now() - startTime,
        explanation: 'Có lỗi xảy ra khi đặt phòng tự động'
      };
    }
  }

  async findBestRoom(criteria: InstantBookingRequest, userProfile: UserProfile): Promise<any> {
    // 1. Filter by location
    const hotels = await prisma.hotel.findMany({
      where: {
        city: criteria.location,
        status: 'ACTIVE'
      },
      include: {
        rooms: {
          where: {
            quantity: { gt: 0 },
            capacity: { gte: criteria.guestCount },
            ...(criteria.maxPrice ? { price: { lte: criteria.maxPrice } } : {})
          }
        }
      }
    });
    
    if (hotels.length === 0) return null;
    
    // 2. Score each room
    const scoredRooms = [];
    
    for (const hotel of hotels) {
      for (const room of hotel.rooms) {
        const score = this.calculateScore(room, hotel, userProfile);
        scoredRooms.push({
          ...room,
          hotel,
          hotelId: hotel.id,
          score
        });
      }
    }
    
    // 3. Sort by score and return best
    scoredRooms.sort((a, b) => b.score - a.score);
    
    return scoredRooms[0] || null;
  }

  calculateScore(room: any, hotel: any, userProfile: UserProfile): number {
    let score = 0;
    
    // Rating weight: 40%
    score += (hotel.rating / 5) * 40;
    
    // Price preference: 30%
    if (userProfile.avgPrice > 0) {
      const priceMatch = 1 - Math.abs(room.price - userProfile.avgPrice) / userProfile.avgPrice;
      score += Math.max(0, priceMatch) * 30;
    } else {
      // Nếu chưa có history, ưu tiên giá trung bình
      score += 15;
    }
    
    // Amenity match: 20%
    if (userProfile.preferredAmenities.length > 0) {
      const matchedAmenities = room.amenities.filter((a: string) => 
        userProfile.preferredAmenities.includes(a)
      );
      const amenityMatch = matchedAmenities.length / userProfile.preferredAmenities.length;
      score += amenityMatch * 20;
    } else {
      score += 10;
    }
    
    // Location preference: 10%
    if (userProfile.favoriteLocations.includes(hotel.city)) {
      score += 10;
    }
    
    return score;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    
    const behaviorPattern = await prisma.behaviorPattern.findUnique({
      where: { userId }
    });
    
    return {
      avgPrice: behaviorPattern?.avgPricePerNight || 1500000,
      preferredAmenities: profile?.preferredAmenities || [],
      favoriteLocations: profile?.favoriteLocations || []
    };
  }
}

export const instantBookingService = new InstantBookingService();
