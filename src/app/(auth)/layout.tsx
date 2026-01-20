import Link from "next/link";
import { Gift, CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-indigo-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80" 
                alt="Hotel Background" 
                className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-indigo-900/60 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-indigo-900 font-bold">L</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Lumina Stay</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 text-sm font-medium">
             <Gift className="h-4 w-4" /> Ưu đãi thành viên mới
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">
            Đăng ký hôm nay, <br/> nhận ngay <span className="text-yellow-400">1.000.000đ</span>
          </h2>
          <ul className="space-y-4 text-lg text-indigo-100">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Voucher giảm giá đặt phòng</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Tích điểm hoàn tiền 10%</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-indigo-300">
          © 2026 Lumina Stay Inc.
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-zinc-900 min-h-screen">
        <div className="lg:hidden w-full max-w-md mb-6 bg-indigo-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 opacity-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80" className="w-full h-full object-cover"/>
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-yellow-300 text-sm font-bold uppercase tracking-wider">
                    <Gift className="h-4 w-4" /> Quà tặng 1 Triệu
                </div>
                <h3 className="text-xl font-bold leading-tight">Đăng ký thành viên Lumina ngay hôm nay.</h3>
            </div>
        </div>

        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {children}
        </div>
      </div>
    </div>
  );
}