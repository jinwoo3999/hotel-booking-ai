"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, Bot, User, Loader2, Calendar, MapPin, Users } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  actions?: Array<{
    type: 'book_room' | 'show_hotels' | 'check_availability' | 'cancel_booking';
    data: any;
  }>;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '👋 Xin chào! Tôi là trợ lý AI của Lumina Stay. Tôi có thể giúp bạn tìm khách sạn, đặt phòng và tư vấn du lịch. Bạn cần hỗ trợ gì?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lắng nghe sự kiện từ QuickActionCard
  useEffect(() => {
    const handleOpenChatWithMessage = (event: CustomEvent) => {
      setIsOpen(true);
      setInputMessage(event.detail);
    };

    window.addEventListener('openChatWithMessage', handleOpenChatWithMessage as EventListener);
    
    return () => {
      window.removeEventListener('openChatWithMessage', handleOpenChatWithMessage as EventListener);
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
          actions: data.actions || []
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '❌ Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingAction = async (action: any) => {
    if (action.type === 'book_room') {
      setIsLoading(true);
      
      // Add a processing message
      const processingMessage: Message = {
        id: Date.now().toString(),
        content: '⏳ Đang xử lý đặt phòng cho bạn...',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, processingMessage]);
      
      try {
        const response = await fetch('/api/ai/book-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data),
        });

        const result = await response.json();
        
        // Remove processing message and add result
        setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
        
        const resultMessage: Message = {
          id: Date.now().toString(),
          content: result.success 
            ? `✅ ${result.message}\n\n📋 **Chi tiết đặt phòng:**\n🏨 ${result.booking.hotel}\n🛏️ ${result.booking.room}\n📅 ${result.booking.checkIn} - ${result.booking.checkOut}\n💰 ${result.booking.totalPrice.toLocaleString()}đ\n👥 ${result.booking.guestCount} khách\n\n📝 **Các bước tiếp theo:**\n${result.nextSteps?.map((step: string) => `• ${step}`).join('\n') || ''}`
            : `❌ ${result.error}`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, resultMessage]);
        
        if (result.success && result.paymentUrl) {
          // Add redirect message
          const redirectMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: '🔄 Đang chuyển đến trang thanh toán trong 3 giây...',
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, redirectMessage]);
          
          setTimeout(() => {
            window.location.href = result.paymentUrl;
          }, 3000);
        }
      } catch (error) {
        // Remove processing message
        setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
        
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: '❌ Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại hoặc đặt phòng thủ công.',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Auto-trigger booking actions from AI responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && !lastMessage.isUser && lastMessage.actions) {
      const bookingAction = lastMessage.actions.find(action => action.type === 'book_room');
      if (bookingAction) {
        // Auto-trigger booking after a short delay
        setTimeout(() => {
          handleBookingAction(bookingAction);
        }, 1000);
      }
    }
  }, [messages]);

  const renderActionButtons = (actions: any[]) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        {actions.map((action, index) => (
          <div key={index}>
            {action.type === 'show_hotels' && (
              <div className="space-y-2">
                {action.data.hotels?.slice(0, 2).map((hotel: any, hotelIndex: number) => (
                  <Card key={hotelIndex} className="p-3 bg-blue-50 border-blue-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{hotel.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{hotel.city}</span>
                          <span>⭐ {hotel.rating}</span>
                        </div>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Từ {hotel.rooms[0]?.price?.toLocaleString() || 0}đ/đêm
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => window.location.href = `/hotels/${hotel.id}`}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {action.type === 'check_availability' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800 mb-2">
                  🎯 Sẵn sàng đặt phòng tại {action.data.location}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => setInputMessage(`Đặt phòng ${action.data.hotels[0]?.name} ngày mai 1 đêm cho 2 người`)}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Đặt ngày mai
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => setInputMessage(`Đặt phòng cuối tuần tại ${action.data.location}`)}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Cuối tuần
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const quickQuestions = [
    "Tìm khách sạn Đà Lạt",
    "Voucher giảm giá",
    "Cách đặt phòng",
    "Địa điểm du lịch"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Nút mở chat */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg z-50 p-0"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Widget chat */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="bg-indigo-600 text-white rounded-t-lg p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Trợ lý AI Lumina
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-indigo-700 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!message.isUser && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        {!message.isUser && message.actions && renderActionButtons(message.actions)}
                      </div>
                      {message.isUser && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Câu hỏi nhanh */}
            {messages.length === 1 && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Câu hỏi thường gặp:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs h-7"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Form nhập tin nhắn */}
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}