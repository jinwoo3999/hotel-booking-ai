"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, MapPin, Star, Tag, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function BookRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roomId = params.roomId as string;
  const hotelId = searchParams.get('hotelId');
  const guests = parseInt(searchParams.get('guests') || '2');
  const nights = parseInt(searchParams.get('nights') || '1');
  const voucherParam = searchParams.get('voucher') || '';

  const [room, setRoom] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [voucherCode, setVoucherCode] = useState(voucherParam);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PAY_NOW' | 'PAY_AT_HOTEL'>('PAY_NOW');

  useEffect(() => {
    fetchData();
    fetchAvailableVouchers();
  }, [roomId, hotelId]);

  const fetchData = async () => {
    try {
      // Fetch room details
      const roomRes = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomRes.json();
      
      if (roomData.success) {
        setRoom(roomData.room);
        
        // Fetch hotel details
        if (roomData.room.hotelId) {
          const hotelRes = await fetch(`/api/hotels?id=${roomData.room.hotelId}`);
          const hotelData = await hotelRes.json();
          if (hotelData.success && hotelData.hotels.length > 0) {
            setHotel(hotelData.hotels[0]);
          }
        }
      }
      
      // Auto-apply voucher if provided
      if (voucherParam) {
        await validateVoucher(voucherParam);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVouchers = async () => {
    try {
      const response = await fetch('/api/vouchers');
      const data = await response.json();
      if (data.success) {
        setAvailableVouchers(data.vouchers || []);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const validateVoucher = async (code: string) => {
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, totalAmount: calculateBasePrice() })
      });
      
      const data = await response.json();
      if (data.valid) {
        setAppliedVoucher(data.voucher);
        toast.success(`Áp dụng voucher ${code} thành công!`);
      } else {
        toast.error(data.message || 'Voucher không hợp lệ');
        setAppliedVoucher(null);
      }
    } catch (error) {
      console.error('Error validating voucher:', error);
    }
  };

  const calculateBasePrice = () => {
    if (!room) return 0;
    return room.price * nights;
  };

  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;
    const basePrice = calculateBasePrice();
    
    if (appliedVoucher.type === 'AMOUNT') {
      return Math.min(appliedVoucher.discount, basePrice);
    } else {
      return basePrice * (appliedVoucher.discount / 100);
    }
  };

  const calculateTotal = () => {
    return calculateBasePrice() - calculateDiscount();
  };

  const handleBooking = async () => {
    if (!guestName || !guestEmail || !guestPhone) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setBooking(true);
    try {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 1); // Tomorrow
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + nights);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          hotelId: room.hotelId,
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString(),
          paymentMethod,
          guestName,
          guestPhone,
          note: specialRequests || `Email: ${guestEmail}`,
          voucherCode: appliedVoucher?.code || undefined
        })
      });

      const data = await response.json();
      
      if (data.success && data.booking) {
        toast.success('Đặt phòng thành công!');
        
        // Redirect based on payment method
        if (paymentMethod === 'PAY_NOW') {
          router.push(`/payment/${data.booking.id}`);
        } else {
          router.push(`/dashboard/booking/${data.booking.id}`);
        }
      } else {
        toast.error(data.message || 'Đặt phòng thất bại');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Có lỗi xảy ra khi đặt phòng');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!room || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <p className="text-red-600">Không tìm thấy thông tin phòng</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Xác nhận đặt phòng</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel & Room Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Thông tin phòng</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{hotel.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{hotel.rating}</span>
                    <span className="text-gray-400">•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{hotel.address}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="font-bold text-gray-900">{room.name}</p>
                  <p className="text-sm text-gray-600">{room.description}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{nights} đêm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{guests} người</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Guest Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Thông tin khách hàng</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input
                    id="name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="0912345678"
                  />
                </div>
                <div>
                  <Label htmlFor="requests">Yêu cầu đặc biệt (tùy chọn)</Label>
                  <Input
                    id="requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="VD: Phòng tầng cao, giường đôi..."
                  />
                </div>

                {/* Payment Method Selection */}
                <div>
                  <Label className="mb-3 block">Phương thức thanh toán *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PAY_NOW')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        paymentMethod === 'PAY_NOW'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-semibold text-sm">Thanh toán ngay</span>
                      </div>
                      <p className="text-xs text-gray-600">Thẻ/QR/Chuyển khoản</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PAY_AT_HOTEL')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        paymentMethod === 'PAY_AT_HOTEL'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Thanh toán tại khách sạn</span>
                      </div>
                      <p className="text-xs text-gray-600">Tiền mặt khi nhận phòng</p>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Price Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Chi tiết giá</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giá phòng × {nights} đêm</span>
                  <span className="font-semibold">{calculateBasePrice().toLocaleString()}đ</span>
                </div>
                
                {appliedVoucher && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá ({appliedVoucher.code})</span>
                    <span className="font-semibold">-{calculateDiscount().toLocaleString()}đ</span>
                  </div>
                )}
              </div>

              {/* Voucher Input */}
              <div className="mb-4 pb-4 border-b">
                <Label className="text-sm mb-2 block font-semibold">🎫 Mã giảm giá</Label>
                <div className="flex gap-2">
                  <Input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã voucher (VD: WELCOME2026)"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => validateVoucher(voucherCode)}
                    variant="outline"
                    size="sm"
                    disabled={!voucherCode}
                    className="px-3"
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Available Vouchers */}
                {availableVouchers.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowVoucherList(!showVoucherList)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {showVoucherList ? '▼' : '▶'} Xem voucher có sẵn ({availableVouchers.length})
                    </button>
                    
                    {showVoucherList && (
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {availableVouchers.slice(0, 5).map((voucher: any) => {
                          const basePrice = calculateBasePrice();
                          const canUse = !voucher.minSpend || basePrice >= voucher.minSpend;
                          const discount = voucher.type === 'AMOUNT' 
                            ? voucher.discount 
                            : Math.floor(basePrice * voucher.discount / 100);
                          
                          return (
                            <button
                              key={voucher.id}
                              type="button"
                              onClick={() => {
                                if (canUse) {
                                  setVoucherCode(voucher.code);
                                  validateVoucher(voucher.code);
                                  setShowVoucherList(false);
                                }
                              }}
                              disabled={!canUse}
                              className={`w-full p-2 border rounded-lg text-left text-xs transition-all ${
                                canUse 
                                  ? 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50' 
                                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-bold text-indigo-600">{voucher.code}</div>
                                  <div className="text-gray-600 line-clamp-1">{voucher.description}</div>
                                  {!canUse && voucher.minSpend && (
                                    <div className="text-red-500 text-[10px] mt-1">
                                      Yêu cầu tối thiểu {voucher.minSpend.toLocaleString()}đ
                                    </div>
                                  )}
                                </div>
                                <div className="text-green-600 font-bold">
                                  -{discount.toLocaleString()}đ
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                
                {voucherCode && !appliedVoucher && (
                  <p className="text-xs text-gray-500 mt-1">
                    Nhấn nút để kiểm tra voucher
                  </p>
                )}
              </div>

              <div className="pt-4 border-t mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Tổng cộng</span>
                  <span className="text-2xl font-black text-indigo-600">
                    {calculateTotal().toLocaleString()}đ
                  </span>
                </div>
                {appliedVoucher && (
                  <p className="text-xs text-green-600 text-right mt-1">
                    Tiết kiệm {calculateDiscount().toLocaleString()}đ
                  </p>
                )}
              </div>

              <Button
                onClick={handleBooking}
                disabled={booking}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12"
              >
                {booking ? (
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

              <p className="text-xs text-gray-500 text-center mt-3">
                {paymentMethod === 'PAY_NOW' 
                  ? 'Bạn sẽ được chuyển đến trang thanh toán'
                  : 'Thanh toán khi nhận phòng tại khách sạn'
                }
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
