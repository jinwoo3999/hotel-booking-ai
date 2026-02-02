import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketPercent, Copy, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function VoucherPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // Lấy danh sách Voucher từ DB
  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: 'desc' } // Giờ dòng này sẽ chạy OK
  });

  return (
    <div className="pb-20">
      <main className="container mx-auto max-w-4xl px-4 py-2">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TicketPercent className="h-8 w-8 text-indigo-600"/> Kho Voucher
            </h1>
            <p className="text-gray-500">Lưu mã để áp dụng khi đặt phòng nhé!</p>
        </div>

        {vouchers.length > 0 ? (
            <div className="grid gap-4">
                {vouchers.map((voucher) => (
                    <div key={voucher.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
                        
                        {/* Trang trí */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>

                        <div className="flex items-center gap-4 w-full md:w-auto z-10">
                            <div className="h-16 w-16 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-indigo-200 border-dashed">
                                %
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{voucher.code}</h3>
                                <p className="text-sm text-gray-600">{voucher.description}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</span>
                                    {voucher.minSpend && <span>• Đơn tối thiểu: {(voucher.minSpend/1000).toLocaleString()}k</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:items-end gap-1 w-full md:w-auto z-10">
                            <p className="text-2xl font-black text-indigo-600">
                                {voucher.type === 'PERCENT' ? `-${voucher.discount}%` : `-${(voucher.discount/1000).toLocaleString()}k`}
                            </p>
                            <Badge variant="secondary" className={voucher.usedCount >= voucher.usageLimit ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}>
                                {voucher.usedCount >= voucher.usageLimit ? "Hết lượt dùng" : "Đang có hiệu lực"}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <TicketPercent className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900">Chưa có mã giảm giá nào</h3>
                <p className="text-gray-500 text-sm">Hãy theo dõi các chương trình khuyến mãi sắp tới nhé.</p>
            </div>
        )}
      </main>
    </div>
  );
}