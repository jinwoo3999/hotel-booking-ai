"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Zap, Loader2, Bot, User, Sparkles, Send, X, ArrowRight, CreditCard } from "lucide-react";

type Message = {
  role: 'user' | 'ai' | 'system';
  content: string;
  reasoning?: string;
  data?: any;
  timestamp: Date;
};

// Booking Form Component with Date Selection
function BookingForm({ data, onSubmit }: { data: any; onSubmit: (formData: any) => void }) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<any>(data.bestVoucher);
  const [paymentMethod, setPaymentMethod] = useState<'PAY_NOW' | 'PAY_AT_HOTEL'>('PAY_NOW');
  const [submitting, setSubmitting] = useState(false);

  const vouchers = data.vouchers || [];
  const room = data.selectedRoom;

  // Set default dates on mount
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    setCheckInDate(tomorrow.toISOString().split('T')[0]);
    setCheckOutDate(dayAfter.toISOString().split('T')[0]);
  }, []);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, nights);
  };

  const calculateDiscount = (voucher: any) => {
    if (!voucher) return 0;
    const nights = calculateNights();
    const baseAmount = room.price * nights;
    
    // Check minSpend requirement
    if (voucher.minSpend && baseAmount < voucher.minSpend) {
      return 0;
    }
    
    return voucher.type === 'AMOUNT' 
      ? voucher.discount 
      : (baseAmount * voucher.discount / 100);
  };

  const calculateFinalPrice = () => {
    const nights = calculateNights();
    const baseAmount = room.price * nights;
    const discount = calculateDiscount(selectedVoucher);
    return Math.max(0, baseAmount - discount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone || !checkInDate || !checkOutDate) return;
    
    const nights = calculateNights();
    if (nights < 1) {
      alert('Ngày check-out phải sau ngày check-in');
      return;
    }
    
    setSubmitting(true);
    await onSubmit({ 
      guestName, 
      guestEmail, 
      guestPhone,
      checkInDate,
      checkOutDate,
      nights,
      selectedVoucher,
      paymentMethod,
      finalPrice: calculateFinalPrice()
    });
    setSubmitting(false);
  };

  const nights = calculateNights();
  const baseAmount = room.price * nights;
  const discount = calculateDiscount(selectedVoucher);
  const voucherMeetsMinSpend = !selectedVoucher?.minSpend || baseAmount >= selectedVoucher.minSpend;

  return (
    <Card className="mt-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="text-sm font-bold text-green-900 mb-3">
          📝 Thông tin đặt phòng
        </div>
        
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Check-in *</label>
            <Input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Check-out *</label>
            <Input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate}
              required
              className="text-sm"
            />
          </div>
        </div>

        <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 text-blue-800">
          📅 {nights} đêm • Giá phòng: {baseAmount.toLocaleString()}đ
        </div>
        
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Họ và tên *</label>
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Nguyễn Văn A"
            required
            className="text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Email *</label>
          <Input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Số điện thoại *</label>
          <Input
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="0123456789"
            required
            className="text-sm"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-2">Phương thức thanh toán *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('PAY_NOW')}
              className={`p-2 border-2 rounded-lg text-left text-xs transition-all ${
                paymentMethod === 'PAY_NOW' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <div className="font-semibold">💳 Thanh toán ngay</div>
              <div className="text-[10px] text-gray-600">Thẻ/QR/Chuyển khoản</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('PAY_AT_HOTEL')}
              className={`p-2 border-2 rounded-lg text-left text-xs transition-all ${
                paymentMethod === 'PAY_AT_HOTEL' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <div className="font-semibold">🏨 Tại khách sạn</div>
              <div className="text-[10px] text-gray-600">Tiền mặt khi nhận phòng</div>
            </button>
          </div>
        </div>

        {/* Voucher Selection */}
        {vouchers.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">Chọn voucher</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className={`w-full p-2 border-2 rounded-lg text-left text-xs transition-all ${
                  !selectedVoucher ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Không dùng voucher</span>
                  {!selectedVoucher && (
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
              
              {vouchers.map((v: any) => {
                const voucherDiscount = calculateDiscount(v);
                const meetsMinSpend = !v.minSpend || baseAmount >= v.minSpend;
                const isSelected = selectedVoucher?.code === v.code;
                
                return (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => meetsMinSpend ? setSelectedVoucher(v) : null}
                    disabled={!meetsMinSpend}
                    className={`w-full p-2 border-2 rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : meetsMinSpend
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-indigo-600">{v.code}</span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[10px]">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-600 line-clamp-2 mb-1">{v.description}</p>
                        {v.aiReason && (
                          <p className="text-[10px] text-blue-600 line-clamp-2">💡 {v.aiReason}</p>
                        )}
                        {!meetsMinSpend && (
                          <p className="text-[10px] text-red-600 mt-1">
                            ⚠️ Yêu cầu tối thiểu {v.minSpend.toLocaleString()}đ
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold text-green-600 whitespace-nowrap">
                          -{voucherDiscount.toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="bg-white rounded-lg p-3 border-2 border-gray-200">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Giá phòng × {nights} đêm</span>
              <span className="font-semibold">{baseAmount.toLocaleString()}đ</span>
            </div>
            {selectedVoucher && voucherMeetsMinSpend && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá ({selectedVoucher.code})</span>
                <span className="font-semibold">-{discount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t-2 border-gray-200">
              <span className="font-bold text-gray-900">Tổng cộng</span>
              <span className="font-black text-lg text-indigo-600">{calculateFinalPrice().toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {paymentMethod === 'PAY_NOW' ? 'Xác nhận & Thanh toán' : 'Xác nhận đặt phòng'}
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

export default function EnterpriseAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addAIMessage(
        "👋 Xin chào! Tôi là **AI Concierge** của Lumina Stay.\n\nHãy nói với tôi: *\"Tôi muốn đi du lịch Đà Lạt 2 người\"* hoặc chọn gợi ý bên dưới!",
        "Khởi tạo AI Assistant - Sẵn sàng xử lý yêu cầu đặt phòng"
      );
    }
  }, [isOpen]);

  // Listen for external events to open chat with message
  useEffect(() => {
    const handleOpenAIChat = (event: any) => {
      const message = event.detail?.message;
      if (message) {
        setIsOpen(true);
        setTimeout(() => {
          setInput(message);
          setTimeout(() => {
            handleSend();
          }, 100);
        }, 300);
      }
    };

    window.addEventListener('openAIChat', handleOpenAIChat);
    return () => window.removeEventListener('openAIChat', handleOpenAIChat);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addAIMessage = (content: string, reasoning?: string, data?: any) => {
    setMessages(prev => [...prev, {
      role: 'ai',
      content,
      reasoning,
      data,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      role: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, {
      role: 'system',
      content,
      timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    addUserMessage(userInput);
    setInput('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const lower = userInput.toLowerCase();
    
    // Detect intent
    let intent = 'leisure';
    if (lower.includes('công tác') || lower.includes('business')) intent = 'business';
    else if (lower.includes('trăng mật') || lower.includes('honeymoon')) intent = 'honeymoon';
    else if (lower.includes('gia đình') || lower.includes('family')) intent = 'family';

    // Detect city
    let city = '';
    const cities = ['đà lạt', 'hà nội', 'đà nẵng', 'nha trang', 'hồ chí minh', 'phú quốc', 'vũng tàu', 'sapa'];
    for (const c of cities) {
      if (lower.includes(c)) {
        city = c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    // Detect guests
    let guests = 2;
    const guestMatch = userInput.match(/(\d+)\s*(người|khách|guest)/i);
    if (guestMatch) guests = parseInt(guestMatch[1]);

    if (!city) {
      addAIMessage(
        "Tôi hiểu bạn muốn đi du lịch! Nhưng bạn có thể cho tôi biết **điểm đến** không?\n\nVí dụ: Đà Lạt, Hà Nội, Đà Nẵng, Nha Trang...",
        "Thiếu thông tin điểm đến - cần hỏi lại để có thể tìm kiếm"
      );
      setLoading(false);
      return;
    }

    const intentText = intent === 'business' ? 'công tác' : intent === 'honeymoon' ? 'trăng mật' : intent === 'family' ? 'gia đình' : 'du lịch';
    addAIMessage(
      `🧠 Tôi hiểu rồi!\n\n• **Mục đích:** ${intentText}\n• **Điểm đến:** ${city}\n• **Số người:** ${guests}\n\nĐể tôi phân tích và tìm khách sạn tốt nhất cho bạn...`,
      `NLP Analysis:\n- Intent: ${intent}\n- Location: ${city}\n- Guests: ${guests}`
    );

    try {
      const res = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, city, guests, nights: 1 }),
      });

      const data = await res.json();

      if (data.success && data.hotels && data.hotels.length > 0) {
        addAIMessage(
          `✨ **Phân tích hoàn tất!**\n\nTôi đã tìm được **${data.hotels.length} khách sạn** phù hợp tại ${city}.\n\n🏆 **Khách sạn tốt nhất cho bạn:**\n**${data.hotels[0].name}** (${data.hotels[0].rating}⭐)\n📍 ${data.hotels[0].address}\n\n💡 Tôi cũng tìm được **${data.recommendedVouchers?.length || 0} voucher** có thể tiết kiệm cho bạn!\n\nBạn muốn xem chi tiết không?`,
          `AI Ranking: ${data.hotels[0].name} is optimal`,
          { hotels: data.hotels, vouchers: data.recommendedVouchers, intent, city, guests }
        );
      } else {
        addAIMessage(
          `😔 Xin lỗi, tôi không tìm thấy khách sạn phù hợp tại ${city}.\n\nBạn có muốn thử điểm đến khác không?`,
          `No hotels found in ${city}`
        );
      }
    } catch (error) {
      addAIMessage(
        "😓 Xin lỗi, có lỗi kết nối. Vui lòng thử lại sau.",
        "API connection error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: { intent: string; city: string; label: string }) => {
    const message = `Tôi muốn ${action.intent === 'business' ? 'đi công tác' : action.intent === 'honeymoon' ? 'đi trăng mật' : action.intent === 'family' ? 'đi du lịch cùng gia đình' : 'đi du lịch'} ${action.city} 2 người`;
    setInput(message);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleSelectRoomFromChat = async (room: any, contextData: any) => {
    addUserMessage(`Tôi muốn đặt phòng ${room.name}`);
    
    const vouchers = contextData.vouchers || [];
    let bestVoucher: any = null;
    let maxDiscount = 0;

    // Find best voucher based on 1 night (will recalculate in form based on actual nights)
    vouchers.forEach((v: any) => {
      if (v.minSpend && room.price < v.minSpend) return; // Skip if doesn't meet minSpend for 1 night
      const discount = v.type === 'AMOUNT' ? v.discount : (room.price * v.discount / 100);
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestVoucher = v;
      }
    });

    let message = `✅ Tuyệt vời! Bạn đã chọn **${room.name}**\n\n`;
    message += `💰 Giá: ${room.price.toLocaleString()}đ/đêm\n`;
    message += `📝 ${room.description}\n\n`;
    
    if (bestVoucher) {
      message += `🎁 Voucher đề xuất: **${bestVoucher.code}**\n`;
      message += `💡 ${bestVoucher.aiReason || 'Tiết kiệm tối đa cho bạn'}\n\n`;
    }

    message += `Vui lòng chọn ngày và điền thông tin để hoàn tất đặt phòng:`;

    addAIMessage(message, undefined, {
      ...contextData,
      selectedRoom: room,
      bestVoucher,
      showBookingForm: true
    });
  };

  const handleSelectHotelFromChat = async (hotel: any, contextData: any) => {
    addUserMessage(`Xem chi tiết ${hotel.name}`);
    addSystemMessage('🔄 Đang tải thông tin phòng...');

    try {
      const res = await fetch(`/api/rooms?hotelId=${hotel.id}`);
      const data = await res.json();

      if (data.success && data.rooms && data.rooms.length > 0) {
        let message = `🏨 **${hotel.name}**\n`;
        message += `⭐ ${hotel.rating}/5 • 📍 ${hotel.address}\n\n`;
        message += `Tìm thấy **${data.rooms.length} phòng** available. Chọn phòng bạn muốn:\n\n`;

        addAIMessage(message, undefined, {
          ...contextData,
          hotel,
          rooms: data.rooms,
          showRooms: true
        });
      } else {
        addAIMessage(`😔 Xin lỗi, hiện tại ${hotel.name} không có phòng trống.`);
      }
    } catch (error) {
      addAIMessage('😓 Có lỗi khi tải thông tin phòng. Vui lòng thử lại.');
    }
  };

  const handleBookingSubmit = async (formData: any, contextData: any) => {
    addSystemMessage('🔄 Đang xử lý đặt phòng...');
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: contextData.selectedRoom.id,
          hotelId: contextData.hotel.id,
          checkIn: formData.checkInDate,
          checkOut: formData.checkOutDate,
          paymentMethod: formData.paymentMethod,
          guestName: formData.guestName,
          guestPhone: formData.guestPhone,
          note: `Đặt qua AI - ${contextData.guests} người`,
          voucherCode: formData.selectedVoucher?.code || undefined
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.booking) {
        // Close AI chat
        setIsOpen(false);
        setMessages([]);
        
        // Redirect to payment page
        if (formData.paymentMethod === 'PAY_NOW') {
          window.location.href = `/payment/${data.booking.id}`;
        } else {
          window.location.href = `/dashboard/booking/${data.booking.id}`;
        }
      } else {
        addAIMessage(
          `😔 Xin lỗi, có lỗi xảy ra: ${data.message || 'Unknown error'}.\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.`
        );
      }
    } catch (error) {
      console.error('Booking error:', error);
      addAIMessage(
        '😓 Xin lỗi, có lỗi kết nối. Vui lòng kiểm tra:\n• Đã đăng nhập chưa?\n• Kết nối internet\n• Thử lại sau'
      );
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { intent: 'leisure', city: 'Đà Lạt', label: 'Du lịch Đà Lạt' },
    { intent: 'business', city: 'Hà Nội', label: 'Công tác Hà Nội' },
    { intent: 'honeymoon', city: 'Đà Nẵng', label: 'Trăng mật Đà Nẵng' },
    { intent: 'family', city: 'Nha Trang', label: 'Gia đình Nha Trang' },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center justify-center group"
      >
        <Sparkles className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
      </button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
          <DialogTitle className="sr-only">Trợ lý AI thông minh</DialogTitle>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Trợ lý AI thông minh</h2>
                <p className="text-indigo-100 text-xs">Tìm và đặt phòng nhanh chóng</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white' : msg.role === 'system' ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
                  <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') 
                  }} />
                  
                  {/* Show Hotels - only if not showing rooms */}
                  {msg.data?.hotels && msg.data.hotels.length > 0 && !msg.data?.showRooms && (
                    <div className="mt-3 space-y-2">
                      {msg.data.hotels.slice(0, 3).map((hotel: any) => (
                        <button
                          key={hotel.id}
                          onClick={() => handleSelectHotelFromChat(hotel, msg.data)}
                          className="w-full p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl text-left hover:border-indigo-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex gap-3">
                            <img src={hotel.images[0]} className="w-16 h-16 rounded-lg object-cover" alt={hotel.name} />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 text-sm truncate">{hotel.name}</div>
                              <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                                <span>⭐ {hotel.rating}</span>
                                <span className="text-gray-400">•</span>
                                <span className="truncate">{hotel.address}</span>
                              </div>
                              {hotel.rooms && hotel.rooms[0] && (
                                <div className="text-xs font-semibold text-indigo-600 mt-1">
                                  Từ {hotel.rooms[0].price.toLocaleString()}đ/đêm
                                </div>
                              )}
                            </div>
                            <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Show Rooms */}
                  {msg.data?.showRooms && msg.data.rooms && (
                    <div className="mt-3 space-y-2">
                      {msg.data.rooms.map((room: any) => (
                        <button
                          key={room.id}
                          onClick={() => handleSelectRoomFromChat(room, msg.data)}
                          className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl text-left hover:border-green-400 hover:shadow-md transition-all"
                        >
                          <div className="font-bold text-gray-900 text-sm">{room.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{room.description}</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs font-semibold text-indigo-600">
                              {room.price.toLocaleString()}đ/đêm
                            </div>
                            <div className="text-xs text-gray-500">
                              Còn {room.quantity} phòng
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Show Booking Form */}
                  {msg.data?.showBookingForm && (
                    <BookingForm 
                      data={msg.data}
                      onSubmit={(formData: any) => handleBookingSubmit(formData, msg.data)}
                    />
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-white border-t">
              <div className="text-xs text-gray-500 mb-2">Gợi ý nhanh:</div>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập tin nhắn..."
                className="flex-1"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
