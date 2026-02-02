"use client";

import { useState, useTransition } from "react";
import { register } from "@/lib/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, Lock, User, MapPin, Hotel, Gift, Check, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await register(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/login"); 
      }
    });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans bg-black">
      
      {/* BACKGROUND VIDEO */}
      <video 
        autoPlay loop muted playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source src="https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      {/* NÚT BACK */}
      <Link href="/" className="absolute top-6 left-6 z-30">
        <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white gap-2 rounded-full border border-white/20 backdrop-blur-sm">
            <ArrowLeft className="h-5 w-5" /> Trở về trang chủ
        </Button>
      </Link>

      {/* FORM CONTAINER */}
      <div className="relative z-20 flex items-center justify-center h-full w-full px-4">
          <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl text-white animate-in zoom-in-95 duration-500">
            <CardHeader className="space-y-2 text-center pb-2 pt-6">
                <div className="flex justify-center mb-2">
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                        <MapPin className="h-7 w-7 text-white absolute -mt-1" />
                        <Hotel className="h-4 w-4 text-indigo-200 absolute mt-3" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">Đăng ký thành viên</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 pt-0">
                {/* --- KHỐI ƯU ĐÃI KHỦNG --- */}
                <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-3 flex items-start gap-3 mt-2">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg shrink-0 shadow-lg shadow-orange-500/20">
                        <Gift className="h-6 w-6 text-white animate-bounce" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-1">
                            QUÀ CHÀO MỪNG ĐẶC BIỆT <Sparkles className="h-3 w-3"/>
                        </h4>
                        <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                            Nhận ngay Voucher <span className="text-yellow-300 font-bold text-sm">1.000.000đ</span> (Mã: LUMINA1M) & <span className="text-yellow-300 font-bold">500 điểm thưởng</span> vào ví.
                        </p>
                    </div>
                </div>
                {/* ------------------------- */}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-200 font-medium text-xs uppercase">Họ và tên</Label>
                        <div className="relative group">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                            <Input 
                                id="name" name="name" placeholder="Nguyễn Văn A" required 
                                className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus:bg-white/10 transition-all rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-200 font-medium text-xs uppercase">Email</Label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                            <Input 
                                id="email" name="email" type="email" placeholder="name@example.com" required 
                                className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus:bg-white/10 transition-all rounded-xl"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-200 font-medium text-xs uppercase">Mật khẩu</Label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                            <Input 
                                id="password" name="password" type="password" placeholder="••••••••" required minLength={6}
                                className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus:bg-white/10 transition-all rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 py-1">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                id="newsletter" 
                                name="newsletter"
                                defaultChecked
                                className="peer h-4 w-4 shrink-0 rounded-sm border border-white/30 bg-white/10 focus:ring-2 focus:ring-indigo-500 appearance-none checked:bg-indigo-600 checked:border-indigo-600"
                            />
                            <Check className="absolute top-0.5 left-0.5 h-3 w-3 text-white hidden peer-checked:block pointer-events-none" />
                        </div>
                        <label
                            htmlFor="newsletter"
                            className="text-xs text-gray-400 cursor-pointer select-none"
                        >
                            Đồng ý nhận Voucher qua Email
                        </label>
                    </div>

                    {error && <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm text-center font-medium animate-pulse">{error}</div>}

                    <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 rounded-xl" 
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Đăng ký nhận 1.000.000đ"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="justify-center border-t border-white/10 pt-4 pb-6">
                <p className="text-sm text-gray-400">
                    Đã có tài khoản?{" "}
                    <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
                        Đăng nhập
                    </Link>
                </p>
            </CardFooter>
          </Card>
      </div>
    </div>
  );
}