"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building, Calendar, User, Phone, CheckCircle2, Loader2, Tag } from "lucide-react";
import { createBooking } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BookingForm({ 
  hotelId, 
  rooms, 
  user,
  defaultToday, 
  defaultTomorrow,
  defaultRoomId,
}: { 
  hotelId: string; 
  rooms: Array<{ id: string; name: string; price: number }>;
  user: { name?: string | null; email?: string | null } | null;
  defaultToday: string;
  defaultTomorrow: string;
  defaultRoomId?: string;
}) {
  const [checkIn, setCheckIn] = useState(defaultToday);
  const [checkOut, setCheckOut] = useState(defaultTomorrow);
  const [minCheckOut, setMinCheckOut] = useState(defaultTomorrow);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const initialRoomId = rooms.find((r) => r.id === defaultRoomId)?.id || rooms[0]?.id || "";
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [validatingVoucher, setValidatingVoucher] = useState(false);

  // Tính số đêm và tổng tiền
  const calculateNights = () => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const nights = calculateNights();
  const basePrice = selectedRoom ? selectedRoom.price * nights : 0;

  // Calculate discount
  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;
    
    if (appliedVoucher.type === 'AMOUNT') {
      return Math.min(appliedVoucher.discount, basePrice);
    } else {
      return Math.floor(basePrice * (appliedVoucher.discount / 100));
    }
  };

  const discount = calculateDiscount();
  const totalPrice = basePrice - discount;

  useEffect(() => {
    if (defaultRoomId && rooms.some((r) => r.id === defaultRoomId)) {
      setSelectedRoomId(defaultRoomId);
    }
  }, [defaultRoomId, rooms]);

  // Fetch available vouchers
  useEffect(() => {
    fetchAvailableVouchers();
  }, []);

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
    if (!code.trim()) return;
    
    setValidatingVoucher(true);
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, totalAmount: basePrice })
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
      toast.error('Không thể kiểm tra voucher');
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);

    const nextDay = new Date(newCheckIn);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split("T")[0];
    
    setMinCheckOut(nextDayStr);
    if (checkOut < nextDayStr) setCheckOut(nextDayStr);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await createBooking(formData);
      
      if (result.success && result.redirectTo) {
        toast.success(result.message || "Đặt phòng thành công!");
        router.push(result.redirectTo);
      } else if (result.error) {
        toast.error(result.error);
        if (result.redirectTo) {
          router.push(result.redirectTo);
        }
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      toast.error("Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden w-full">
      <div className="bg-indigo-600 p-4 text-white text-center">
        <h3 className="text-lg font-bold uppercase tracking-wide">Đặt phòng ngay</h3>
      </div>
      
      <div className="p-6">
        <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="hotelId" value={hotelId} />
            <input type="hidden" name="totalPrice" value={totalPrice} />
            <input type="hidden" name="voucherCode" value={appliedVoucher?.code || ''} />
            
            <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Loại phòng</Label>
                <div className="relative">
                    <select 
                        name="roomId" 
                        className="w-full h-12 pl-3 pr-8 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-medium"
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        disabled={isSubmitting}
                    >
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
                {selectedRoom && (
                    <div className="text-right text-indigo-600 font-bold text-lg">
                        {selectedRoom.price.toLocaleString()}đ <span className="text-xs text-gray-500 font-normal">/ đêm</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase">Nhận phòng</Label>
                    <Input 
                      type="date" 
                      name="checkIn" 
                      value={checkIn} 
                      min={defaultToday} 
                      onChange={handleCheckInChange} 
                      required 
                      className="h-10 cursor-pointer" 
                      disabled={isSubmitting}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase">Trả phòng</Label>
                    <Input 
                      type="date" 
                      name="checkOut" 
                      value={checkOut} 
                      min={minCheckOut} 
                      onChange={(e) => setCheckOut(e.target.value)} 
                      required 
                      className="h-10 cursor-pointer" 
                      disabled={isSubmitting}
                    />
                </div>
            </div>

            {/* Voucher Section */}
            <div className="space-y-2 pt-2 border-t border-dashed">
              <Label className="text-gray-700 font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                Mã giảm giá
              </Label>
              <div className="flex gap-2">
                <Input
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã voucher"
                  className="flex-1 h-10"
                  disabled={isSubmitting || validatingVoucher}
                />
                <Button
                  type="button"
                  onClick={() => validateVoucher(voucherCode)}
                  variant="outline"
                  size="sm"
                  disabled={!voucherCode || isSubmitting || validatingVoucher}
                  className="px-4"
                >
                  {validatingVoucher ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Áp dụng'
                  )}
                </Button>
              </div>

              {/* Available Vouchers */}
              {availableVouchers.length > 0 && (
                <div className="mt-2">
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
                        const canUse = !voucher.minSpend || basePrice >= voucher.minSpend;
                        const voucherDiscount = voucher.type === 'AMOUNT' 
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
                            disabled={!canUse || isSubmitting}
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
                                -{voucherDiscount.toLocaleString()}đ
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {appliedVoucher && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">✓ Voucher {appliedVoucher.code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedVoucher(null);
                        setVoucherCode('');
                      }}
                      className="text-green-600 hover:text-green-800 underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hiển thị tổng tiền */}
            {nights > 0 && selectedRoom && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                <div className="flex justify-between items-center text-sm text-indigo-800 mb-2">
                  <span>{selectedRoom.name}</span>
                  <span>{selectedRoom.price.toLocaleString()}đ x {nights} đêm</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between items-center text-sm text-green-600 mb-2">
                    <span>Giảm giá ({appliedVoucher.code})</span>
                    <span>-{discount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg text-indigo-900 border-t border-indigo-200 pt-2">
                  <span>Tổng cộng:</span>
                  <span>{totalPrice.toLocaleString()}đ</span>
                </div>
                {appliedVoucher && (
                  <p className="text-xs text-green-600 text-right mt-1">
                    Tiết kiệm {discount.toLocaleString()}đ
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
                <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
                    <Input 
                      name="guestName" 
                      defaultValue={user?.name || ""} 
                      required 
                      placeholder="Họ và tên khách" 
                      className="pl-9 h-11" 
                      disabled={isSubmitting}
                    />
                </div>
                <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
                    <Input 
                      name="guestPhone" 
                      placeholder="Số điện thoại" 
                      required 
                      className="pl-9 h-11" 
                      disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-dashed">
                <Label className="font-bold text-gray-800">Thanh toán</Label>
                <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-indigo-50 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 relative group bg-gray-50/50">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="PAY_NOW" 
                      className="w-4 h-4 text-indigo-600 accent-indigo-600" 
                      defaultChecked 
                      disabled={isSubmitting}
                    />
                    <div className="ml-3">
                        <div className="flex items-center gap-2 font-bold text-sm text-indigo-900"><CreditCard className="w-4 h-4"/> Thanh toán ngay</div>
                        <p className="text-[11px] text-gray-500 mt-0.5 pl-6">Visa / Mastercard / QR</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 absolute right-3 opacity-0 group-has-[:checked]:opacity-100 transition-all"/>
                </label>
                <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50 has-[:checked]:bg-gray-100 has-[:checked]:border-gray-500 relative group">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="PAY_AT_HOTEL" 
                      className="w-4 h-4 text-gray-600 accent-gray-600" 
                      disabled={isSubmitting}
                    />
                    <div className="ml-3">
                        <div className="flex items-center gap-2 font-bold text-sm text-gray-700"><Building className="w-4 h-4"/> Thanh toán tại khách sạn</div>
                        <p className="text-[11px] text-gray-500 mt-0.5 pl-6">Giữ phòng trước, trả tiền sau</p>
                    </div>
                </label>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg shadow-lg mt-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận Đặt phòng"
                )}
            </Button>
        </form>
      </div>
    </div>
  );
}