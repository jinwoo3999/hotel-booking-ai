"use client";

import { useState, use } from "react";
import { confirmBookingPayment } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentGateway({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [holder, setHolder] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // GIẢ LẬP CHECK THẺ (Delay 2s)
    setTimeout(async () => {
        // Stripe Test Card: 4242 4242 4242 4242
        const cleanNumber = cardNumber.replace(/\s/g, "");
        
        if (cleanNumber === "4242424242424242") {
            await confirmBookingPayment(id);
        } else {
            setError("Thẻ bị từ chối (Mã lỗi: DECLINED)");
            setIsLoading(false);
        }
    }, 2000);
  };

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(" ");
    return v;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans">
      
      {/* Header nhỏ để quay lại */}
      <div className="absolute top-6 left-6">
        <Link href={`/hotels`}>
            <Button variant="ghost" className="text-indigo-900 hover:bg-white/50 gap-2">
                <ArrowLeft className="w-4 h-4"/> Quay lại
            </Button>
        </Link>
      </div>

      {/* Logo Brand */}
      <div className="mb-8 flex items-center gap-2">
         <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">LS</div>
         <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lumina Stay Secure</h1>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-white/50 bg-white/80 backdrop-blur-xl">
        <CardHeader className="text-center border-b border-gray-100 pb-6">
          <div className="flex justify-center mb-4 gap-3 opacity-80">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-6" alt="Visa"/>
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard"/>
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6" alt="Paypal"/>
          </div>
          <CardTitle className="text-lg font-bold text-gray-800">Cổng thanh toán quốc tế</CardTitle>
          <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 w-fit mx-auto px-3 py-1 rounded-full mt-2">
             <ShieldCheck className="w-3 h-3"/> Bảo mật SSL Encrypted
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
            <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Chủ thẻ</Label>
                    <Input 
                        placeholder="NGUYEN VAN A" 
                        className="uppercase h-11 bg-white"
                        value={holder}
                        onChange={(e) => setHolder(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Số thẻ</Label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="4242 4242 4242 4242" 
                            className="pl-10 font-mono text-lg h-11 bg-white" 
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            maxLength={19}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase">Hết hạn</Label>
                        <Input 
                            placeholder="MM/YY" 
                            className="text-center h-11 bg-white"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            maxLength={5}
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase">CVV</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="123" 
                                type="password" 
                                className="pl-9 text-center h-11 bg-white"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                                maxLength={3}
                                required 
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-red-600 text-xs text-center font-bold bg-red-50 p-3 rounded-md border border-red-200 animate-pulse">
                        {error}
                    </div>
                )}

                <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-bold shadow-lg shadow-indigo-200 mt-2"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" /> Đang xử lý giao dịch...
                        </div>
                    ) : (
                        `Thanh toán ngay`
                    )}
                </Button>
            </form>
            
        </CardContent>
      </Card>
    </div>
  );
}