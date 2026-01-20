"use client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, Gift, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function LoyaltySection() {
  const { data: session } = useSession();
  
  const spentAmount = (session?.user as any)?.spentAmount || 0;
  const points = Math.floor(spentAmount / 10000); 

  let rank = "Thành viên Mới";
  let nextRank = "Hạng Bạc";
  let target = 100;
  let progress = (points / target) * 100;

  if (points >= 100 && points < 500) {
    rank = "Hạng Bạc"; nextRank = "Hạng Vàng"; target = 500;
    progress = ((points - 100) / (500 - 100)) * 100;
  } else if (points >= 500) {
    rank = "Hạng Vàng"; nextRank = "Kim Cương"; target = 1000;
    progress = 100;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sửa bg-gradient-to-r thành bg-linear-to-r */}
      <Card className="md:col-span-2 p-6 bg-linear-to-r from-slate-900 to-slate-800 text-white border-none shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10"><Crown className="w-32 h-32" /></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Crown className="text-yellow-400 h-5 w-5" />
                    <span className="font-bold text-yellow-400 tracking-wider text-sm uppercase">{rank}</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{session?.user?.name || "Khách hàng"}</h3>
                <p className="text-slate-300 text-sm mb-6">
                    Điểm tích lũy: <span className="text-white font-bold text-lg">{points}</span> điểm
                </p>
                <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-xs text-slate-300">
                        <span>Tiến độ lên {nextRank}</span>
                        <span>{points}/{target}</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-700" indicatorColor="bg-yellow-400" />
                </div>
            </div>
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                Đổi quà ngay
            </Button>
         </div>
      </Card>
      
      <Link href="/dashboard/vouchers" className="block h-full">
        <Card className="h-full p-6 bg-white border-dashed border-2 border-indigo-200 flex flex-col justify-center items-center text-center hover:border-indigo-400 transition-colors cursor-pointer group">
            <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Gift className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900">Ví Voucher</h3>
            <p className="text-sm text-gray-500 mb-4">Bạn có mã giảm giá chưa dùng</p>
            <span className="text-indigo-600 text-sm font-semibold flex items-center">
                Xem ngay <ChevronRight className="h-4 w-4 ml-1" />
            </span>
        </Card>
      </Link>
    </div>
  );
}