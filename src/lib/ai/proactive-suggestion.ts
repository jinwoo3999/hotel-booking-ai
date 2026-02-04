// Proactive Suggestion Engine - Tạo và gửi gợi ý chủ động
import { prisma } from '@/lib/prisma';
import { behaviorAnalysisEngine } from './behavior-analysis';

export interface ProactiveSuggestion {
  id: string;
  userId: string;
  type: 'deal_alert' | 'seasonal_reminder' | 'price_drop' | 'inventory_warning' | 'combo_offer';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action?: {
    type: 'book' | 'hold' | 'view' | 'dismiss';
    data: any;
  };
  expiresAt?: Date;
  reasoning: string;
}

export class ProactiveSuggestionEngine {
  // Tạo suggestions cho user
  async generateSuggestions(userId: string, context?: any): Promise<ProactiveSuggestion[]> {
    const suggestions: ProactiveSuggestion[] = [];

    // 1. Check behavioral triggers
    const triggers = await behaviorAnalysisEngine.shouldTriggerProactive(userId);
    
    for (const trigger of triggers) {
      const suggestion = await this.createSuggestion(userId, {
        type: trigger.type as any,
        priority: trigger.priority,
        message: trigger.message,
        action: trigger.action,
        reasoning: `Behavioral trigger: ${trigger.type}`
      });
      
      suggestions.push(suggestion);
    }

    // 2. Check for flash deals
    const flashDeals = await this.checkFlashDeals(userId);
    suggestions.push(...flashDeals);

    // 3. Check for combo offers
    const comboOffers = await this.checkComboOffers(userId);
    suggestions.push(...comboOffers);

    // 4. Check for low inventory warnings
    if (context?.viewingHotel) {
      const inventoryWarning = await this.checkInventoryWarning(userId, context.viewingHotel);
      if (inventoryWarning) {
        suggestions.push(inventoryWarning);
      }
    }

    return suggestions;
  }

  // Tạo suggestion và lưu vào DB
  async createSuggestion(userId: string, data: {
    type: string;
    priority: string;
    message: string;
    action?: any;
    reasoning: string;
    expiresAt?: Date;
  }): Promise<ProactiveSuggestion> {
    const suggestion = await prisma.proactiveSuggestion.create({
      data: {
        userId,
        type: data.type,
        priority: data.priority,
        message: data.message,
        actionType: data.action?.type,
        actionData: data.action?.data,
        reasoning: data.reasoning,
        expiresAt: data.expiresAt,
        status: 'pending'
      }
    });

    return {
      id: suggestion.id,
      userId: suggestion.userId,
      type: suggestion.type as any,
      priority: suggestion.priority as any,
      message: suggestion.message,
      action: suggestion.actionType ? {
        type: suggestion.actionType as any,
        data: suggestion.actionData
      } : undefined,
      expiresAt: suggestion.expiresAt || undefined,
      reasoning: suggestion.reasoning || ''
    };
  }

  // Kiểm tra xem có nên show suggestion không
  async shouldShowSuggestion(suggestionId: string, userState: any): Promise<boolean> {
    const suggestion = await prisma.proactiveSuggestion.findUnique({
      where: { id: suggestionId }
    });

    if (!suggestion) return false;
    if (suggestion.status !== 'pending') return false;
    if (suggestion.expiresAt && suggestion.expiresAt < new Date()) return false;

    // Check user state (e.g., không show quá nhiều suggestions cùng lúc)
    const recentSuggestions = await prisma.proactiveSuggestion.count({
      where: {
        userId: suggestion.userId,
        status: 'delivered',
        deliveredAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last 1 hour
        }
      }
    });

    if (recentSuggestions >= 3) return false; // Max 3 suggestions per hour

    return true;
  }

  // Đánh dấu suggestion đã delivered
  async markAsDelivered(suggestionId: string): Promise<void> {
    await prisma.proactiveSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: 'delivered',
        deliveredAt: new Date()
      }
    });
  }

  // Đánh dấu user đã act on suggestion
  async markAsActed(suggestionId: string): Promise<void> {
    await prisma.proactiveSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: 'acted',
        actedAt: new Date()
      }
    });
  }

  // Dismiss suggestion
  async dismissSuggestion(suggestionId: string): Promise<void> {
    await prisma.proactiveSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: 'dismissed'
      }
    });
  }

  // Get pending suggestions for user
  async getPendingSuggestions(userId: string): Promise<ProactiveSuggestion[]> {
    const suggestions = await prisma.proactiveSuggestion.findMany({
      where: {
        userId,
        status: 'pending',
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 5
    });

    return suggestions.map(s => ({
      id: s.id,
      userId: s.userId,
      type: s.type as any,
      priority: s.priority as any,
      message: s.message,
      action: s.actionType ? {
        type: s.actionType as any,
        data: s.actionData
      } : undefined,
      expiresAt: s.expiresAt || undefined,
      reasoning: s.reasoning || ''
    }));
  }

  // Private helper methods
  private async checkFlashDeals(userId: string): Promise<ProactiveSuggestion[]> {
    // TODO: Implement flash deal detection
    // For now, return empty array
    return [];
  }

  private async checkComboOffers(userId: string): Promise<ProactiveSuggestion[]> {
    // TODO: Implement combo offer detection
    // For now, return empty array
    return [];
  }

  private async checkInventoryWarning(userId: string, hotelId: string): Promise<ProactiveSuggestion | null> {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        rooms: {
          include: {
            inventories: {
              where: {
                date: {
                  gte: new Date()
                }
              },
              take: 7
            }
          }
        }
      }
    });

    if (!hotel) return null;

    // Check if any room has low inventory
    for (const room of hotel.rooms) {
      const lowInventoryDays = room.inventories.filter(inv => 
        (inv.total - inv.booked) <= 2 && (inv.total - inv.booked) > 0
      );

      if (lowInventoryDays.length > 0) {
        return await this.createSuggestion(userId, {
          type: 'inventory_warning',
          priority: 'high',
          message: `⚠️ Chỉ còn ${lowInventoryDays[0].total - lowInventoryDays[0].booked} phòng tại ${hotel.name}! Đặt ngay trước khi hết?`,
          action: {
            type: 'book',
            data: { hotelId, roomId: room.id }
          },
          reasoning: 'Low inventory detected',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
      }
    }

    return null;
  }
}

export const proactiveSuggestionEngine = new ProactiveSuggestionEngine();
