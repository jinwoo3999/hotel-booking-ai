"use client";

import { useState, useTransition } from "react";
import { register } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

                <Button 
                    variant="outline" 
                    className="w-full h-12 bg-white text-gray-900 border-none hover:bg-gray-100 font-bold gap-3 text-base transition-transform hover:scale-[1.02] rounded-xl"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Đăng ký bằng Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/20"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-gray-400">Hoặc bằng Email</span></div>
                </div>

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