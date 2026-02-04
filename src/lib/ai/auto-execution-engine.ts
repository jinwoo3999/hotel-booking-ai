// Auto-Execution Engine - Core của hệ thống tự động thực thi
import { consentManager, AutoActionType } from './consent-manager';
import { instantBookingService, InstantBookingRequest } from './instant-booking';
import { prisma } from '@/lib/prisma';

export interface UserInput {
  text?: string;
  voice?: any;
  context: 'search' | 'viewing_hotel' | 'browsing' | 'idle';
}

export interface UserContext {
  userId: string;
  isLoggedIn: boolean;
  currentPage?: string;
  viewingHotel?: string;
}

export interface ExecutionResult {
  action: ExecutedAction;
  status: 'completed' | 'requires_confirmation' | 'failed';
  result: any;
  explanation: string;
  nextSuggestions?: any[];
}

export interface ExecutedAction {
  type: 'instant_booking' | 'room_hold' | 'price_alert' | 'voucher_applied' | 'suggestion';
  data: any;
  timestamp: Date;
  autoExecuted: boolean;
}

export interface DetectedIntent {
  primary: IntentType;
  confidence: number;
  entities: any;
  suggestedAction: any;
  requiresConfirmation: boolean;
}

export enum IntentType {
  INSTANT_BOOKING = 'instant_booking',
  SEARCH_HOTELS = 'search_hotels',
  HOLD_ROOM = 'hold_room',
  CHECK_PRICE = 'check_price',
  GET_DEAL = 'get_deal',
  MODIFY_BOOKING = 'modify_booking',
  CANCEL_BOOKING = 'cancel_booking',
  JUST_BROWSING = 'just_browsing'
}

export class AutoExecutionEngine {
  async executeIntent(input: UserInput, context: UserContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // 1. Detect intent
      const intent = await this.detectIntent(input, context);
      
      // 2. Check consent
      if (intent.requiresConfirmation) {
        return {
          action: {
            type: 'suggestion',
            data: intent.suggestedAction,
            timestamp: new Date(),
            autoExecuted: false
          },
          status: 'requires_confirmation',
          result: null,
          explanation: 'Cần xác nhận từ người dùng'
        };
      }
      
      // 3. Execute based on intent
      switch (intent.primary) {
        case IntentType.INSTANT_BOOKING:
          return await this.executeInstantBooking(intent.entities, context);
          
        case IntentType.SEARCH_HOTELS:
          return await this.executeSearch(intent.entities, context);
          
        default:
          return {
            action: {
              type: 'suggestion',
              data: {},
              timestamp: new Date(),
              autoExecuted: false
            },
            status: 'completed',
            result: null,
            explanation: 'Intent không được hỗ trợ tự động thực thi'
          };
      }
      
    } catch (error) {
      console.error('Auto-execution error:', error);
      
      return {
        action: {
          type: 'suggestion',
          data: {},
          timestamp: new Date(),
          autoExecuted: false
        },
        status: 'failed',
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        explanation: 'Có lỗi xảy ra khi tự động thực thi'
      };
    }
  }

  async detectIntent(input: UserInput, context: UserContext): Promise<DetectedIntent> {
    const text = input.text?.toLowerCase() || '';
    
    // Detect INSTANT_BOOKING intent
    if (/đặt phòng|book|booking/.test(text)) {
      const entities = this.extractEntities(text);
      
      // Check if has enough info for instant booking
      const hasLocation = !!entities.location;
      const hasDates = !!entities.checkIn;
      
      if (hasLocation && hasDates && context.isLoggedIn) {
        // Check consent
        const canAutoBook = await consentManager.canAutoExecute(
          context.userId,
          AutoActionType.INSTANT_BOOKING,
          entities.estimatedPrice
        );
        
        return {
          primary: IntentType.INSTANT_BOOKING,
          confidence: 0.9,
          entities,
          suggestedAction: {
            type: 'instant_booking',
            data: entities
          },
          requiresConfirmation: !canAutoBook
        };
      }
    }
    
    // Detect SEARCH_HOTELS intent
    if (/tìm|khách sạn|hotel|search/.test(text)) {
      return {
        primary: IntentType.SEARCH_HOTELS,
        confidence: 0.8,
        entities: this.extractEntities(text),
        suggestedAction: {
          type: 'search',
          data: this.extractEntities(text)
        },
        requiresConfirmation: false
      };
    }
    
    // Default: JUST_BROWSING
    return {
      primary: IntentType.JUST_BROWSING,
      confidence: 0.5,
      entities: {},
      suggestedAction: null,
      requiresConfirmation: false
    };
  }

  extractEntities(text: string): any {
    const lower = text.toLowerCase();
    
    // Extract location
    const locationMap: Record<string, string[]> = {
      'Đà Nẵng': ['đà nẵng', 'da nang', 'danang', 'dn'],
      'Đà Lạt': ['đà lạt', 'dalat', 'da lat', 'dl'],
      'Hà Nội': ['hà nội', 'hanoi', 'ha noi', 'hn'],
      'Nha Trang': ['nha trang', 'nhatrang', 'nt'],
      'Hồ Chí Minh': ['hồ chí minh', 'sài gòn', 'saigon', 'hcm', 'sg'],
    };
    
    let location = '';
    for (const [city, variants] of Object.entries(locationMap)) {
      if (variants.some(v => lower.includes(v))) {
        location = city;
        break;
      }
    }
    
    // Extract dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkIn = new Date(today);
    let checkOut = new Date(today);
    let hasSpecificDates = false;
    
    if (/hôm nay|today/.test(lower)) {
      checkIn = new Date(today);
      checkOut = new Date(today);
      checkOut.setDate(checkOut.getDate() + 1);
      hasSpecificDates = true;
    } else if (/ngày mai|tomorrow|mai/.test(lower)) {
      checkIn = new Date(today);
      checkIn.setDate(checkIn.getDate() + 1);
      checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 1);
      hasSpecificDates = true;
    } else if (/cuối tuần|weekend/.test(lower)) {
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
      checkIn = new Date(today);
      checkIn.setDate(checkIn.getDate() + daysUntilSaturday);
      checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 2);
      hasSpecificDates = true;
    }
    
    // Extract guest count
    const guestMatch = lower.match(/(\d+)\s*(người|khách|guest)/);
    const guestCount = guestMatch ? parseInt(guestMatch[1]) : 2;
    
    // Estimate price
    const nightsMatch = lower.match(/(\d+)\s*(đêm|night)/);
    const nights = nightsMatch ? parseInt(nightsMatch[1]) : 1;
    const estimatedPrice = 1500000 * nights; // Giá trung bình
    
    return {
      location,
      checkIn: hasSpecificDates ? checkIn : null,
      checkOut: hasSpecificDates ? checkOut : null,
      hasSpecificDates,
      guestCount,
      nights,
      estimatedPrice
    };
  }

  async executeInstantBooking(entities: any, context: UserContext): Promise<ExecutionResult> {
    const request: InstantBookingRequest = {
      userId: context.userId,
      location: entities.location,
      checkIn: entities.checkIn,
      checkOut: entities.checkOut,
      guestCount: entities.guestCount,
      autoSelect: true
    };
    
    const result = await instantBookingService.bookInstantly(request);
    
    return {
      action: {
        type: 'instant_booking',
        data: request,
        timestamp: new Date(),
        autoExecuted: true
      },
      status: result.success ? 'completed' : 'failed',
      result,
      explanation: result.explanation
    };
  }

  async executeSearch(entities: any, context: UserContext): Promise<ExecutionResult> {
    // Search logic here
    return {
      action: {
        type: 'suggestion',
        data: entities,
        timestamp: new Date(),
        autoExecuted: false
      },
      status: 'completed',
      result: { hotels: [] },
      explanation: 'Tìm kiếm khách sạn'
    };
  }

  async canAutoExecute(intent: DetectedIntent, userId: string): Promise<boolean> {
    switch (intent.primary) {
      case IntentType.INSTANT_BOOKING:
        return await consentManager.canAutoExecute(
          userId,
          AutoActionType.INSTANT_BOOKING,
          intent.entities.estimatedPrice
        );
        
      default:
        return false;
    }
  }
}

export const autoExecutionEngine = new AutoExecutionEngine();
