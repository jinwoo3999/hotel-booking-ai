// Consent Manager - Quản lý quyền tự động thực thi
import { prisma } from '@/lib/prisma';

export interface UserConsent {
  userId: string;
  autoBookingEnabled: boolean;
  autoRoomHoldEnabled: boolean;
  autoVoucherEnabled: boolean;
  priceAlertsEnabled: boolean;
  proactiveSuggestionsEnabled: boolean;
  maxAutoBookingAmount: number;
  consentGivenAt: Date;
}

export enum AutoActionType {
  INSTANT_BOOKING = 'instant_booking',
  ROOM_HOLD = 'room_hold',
  VOUCHER_APPLICATION = 'voucher_application',
  PRICE_ALERTS = 'price_alerts',
  PROACTIVE_SUGGESTIONS = 'proactive_suggestions'
}

export class ConsentManager {
  async getConsent(userId: string): Promise<UserConsent | null> {
    const consent = await prisma.userConsent.findUnique({
      where: { userId }
    });
    
    if (!consent) return null;
    
    return {
      userId: consent.userId,
      autoBookingEnabled: consent.autoBookingEnabled,
      autoRoomHoldEnabled: consent.autoRoomHoldEnabled,
      autoVoucherEnabled: consent.autoVoucherEnabled,
      priceAlertsEnabled: consent.priceAlertsEnabled,
      proactiveSuggestionsEnabled: consent.proactiveSuggestionsEnabled,
      maxAutoBookingAmount: consent.maxAutoBookingAmount,
      consentGivenAt: consent.consentGivenAt
    };
  }

  async canAutoExecute(userId: string, actionType: AutoActionType, amount?: number): Promise<boolean> {
    const consent = await this.getConsent(userId);
    
    if (!consent) return false;
    
    switch (actionType) {
      case AutoActionType.INSTANT_BOOKING:
        if (!consent.autoBookingEnabled) return false;
        if (amount && amount > consent.maxAutoBookingAmount) return false;
        return true;
        
      case AutoActionType.ROOM_HOLD:
        return consent.autoRoomHoldEnabled;
        
      case AutoActionType.VOUCHER_APPLICATION:
        return consent.autoVoucherEnabled;
        
      case AutoActionType.PRICE_ALERTS:
        return consent.priceAlertsEnabled;
        
      case AutoActionType.PROACTIVE_SUGGESTIONS:
        return consent.proactiveSuggestionsEnabled;
        
      default:
        return false;
    }
  }

  async createDefaultConsent(userId: string): Promise<UserConsent> {
    const consent = await prisma.userConsent.create({
      data: {
        userId,
        autoBookingEnabled: false, // Mặc định tắt auto-booking
        autoRoomHoldEnabled: true,
        autoVoucherEnabled: true,
        priceAlertsEnabled: true,
        proactiveSuggestionsEnabled: true,
        maxAutoBookingAmount: 3000000 // 3M VND
      }
    });
    
    return {
      userId: consent.userId,
      autoBookingEnabled: consent.autoBookingEnabled,
      autoRoomHoldEnabled: consent.autoRoomHoldEnabled,
      autoVoucherEnabled: consent.autoVoucherEnabled,
      priceAlertsEnabled: consent.priceAlertsEnabled,
      proactiveSuggestionsEnabled: consent.proactiveSuggestionsEnabled,
      maxAutoBookingAmount: consent.maxAutoBookingAmount,
      consentGivenAt: consent.consentGivenAt
    };
  }

  async updateConsent(userId: string, updates: Partial<UserConsent>): Promise<void> {
    await prisma.userConsent.update({
      where: { userId },
      data: updates
    });
  }
}

export const consentManager = new ConsentManager();
