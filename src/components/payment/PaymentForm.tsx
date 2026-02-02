"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, QrCode, CreditCard, CheckCircle } from "lucide-react";

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
}

export function PaymentForm({ bookingId, amount, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("qr");
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);
  const [paymentStep, setPaymentStep] = useState<"select" | "processing" | "success">("select");

  useEffect(() => {
    // Initialize Stripe payment intent when component loads
    const initPayment = async () => {
      try {
        const response = await fetch("/api/payments/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
        
        const data = await response.json();
        if (data.clientSecret) {
          setStripeClientSecret(data.clientSecret);
          setIsDemo(data.isDemo || false);
        }
      } catch (error) {
        console.error("Failed to init payment:", error);
      }
    };
    
    if (bookingId) {
      initPayment();
    }
  }, [bookingId]);

  const handlePayment = async () => {
    setPaymentStep("processing");
    setLoading(true);
    
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call payment confirmation API
      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookingId, 
          paymentMethod: method === "card" ? "STRIPE" : "PAY_AT_HOTEL" 
        }),
      });
      
      if (response.ok) {
        setPaymentStep("success");
        onSuccess?.();
      } else {
        alert("Thanh toán thất bại. Vui lòng thử lại.");
        setPaymentStep("select");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
      setPaymentStep("select");
    } finally {
      setLoading(false);
    }
  };

  if (paymentStep === "success") {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Thanh toán thành công!</h3>
        <p className="text-gray-500">
          Cảm ơn bạn đã đặt phòng. Booking ID: <span className="font-mono text-indigo-600">{bookingId.slice(-8).toUpperCase()}</span>
        </p>
        <Button onClick={() => window.location.href = "/dashboard/history"} className="w-full">
          Xem đơn đặt phòng
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <RadioGroup defaultValue="qr" onValueChange={setMethod} className="grid grid-cols-1 gap-4">
        <div className={`flex items-center justify-between space-x-2 border p-4 rounded-xl cursor-pointer transition-all ${method === 'qr' ? 'border-indigo-600 bg-indigo-50' : 'hover:bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="qr" id="qr" />
            <Label htmlFor="qr" className="cursor-pointer font-bold flex items-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-600"/> VietQR / Momo
            </Label>
          </div>
          <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png" alt="Momo" className="h-6 w-6 rounded-md"/>
        </div>

        <div className={`flex items-center justify-between space-x-2 border p-4 rounded-xl cursor-pointer transition-all ${method === 'card' ? 'border-indigo-600 bg-indigo-50' : 'hover:bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="cursor-pointer font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600"/> Thẻ Quốc tế (Stripe)
            </Label>
          </div>
          <div className="flex gap-1">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4"/>
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Master" className="h-4"/>
          </div>
        </div>
      </RadioGroup>

      {/* Payment Content */}
      {method === 'qr' ? (
        <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-gray-500 mb-2">Quét mã để thanh toán</p>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({
              bank: "MBBANK",
              account: "19067891001111",
              amount: amount,
              content: `LUMINA${bookingId.slice(-6).toUpperCase()}`
            }))}`} 
            alt="QR Code" 
            className="border p-2 rounded-lg"
          />
          <p className="text-xs text-indigo-600 font-bold mt-2">Ngân hàng: MBBank</p>
          <p className="text-xs text-gray-600">Số tài khoản: 19067891001111</p>
          <p className="text-xs text-indigo-600 font-bold">Nội dung: LUMINA{bookingId.slice(-6).toUpperCase()}</p>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-3">Thanh toán bằng thẻ quốc tế qua Stripe</p>
          {stripeClientSecret ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">Stripe Payment Intent đã được tạo!</p>
              <p className="text-xs text-yellow-600 mt-1">Client Secret: {stripeClientSecret.slice(0, 20)}...</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang kết nối Stripe...
            </div>
          )}
        </div>
      )}

      {/* Demo Mode Warning */}
      {isDemo && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            ⚠️ Demo Mode: Đây là hệ thống thanh toán demo. Stripe chưa được cấu hình với API key thật.
          </p>
        </div>
      )}

      {/* Pay Button */}
      <Button 
        className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" 
        onClick={handlePayment}
        disabled={loading || paymentStep === "processing"}
      >
        {loading || paymentStep === "processing" ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...
          </>
        ) : (
          `Thanh toán ${amount.toLocaleString()}đ`
        )}
      </Button>
        
      <p className="text-[10px] text-center text-gray-400">
        Bằng việc thanh toán, bạn đồng ý với điều khoản sử dụng của Lumina Stay
      </p>
    </div>
  );
}
