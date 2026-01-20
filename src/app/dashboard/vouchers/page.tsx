import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketPercent, Copy, Calendar, Sparkles } from "lucide-react";

export default async function VoucherPage() {
  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header: Sửa bg-gradient thành bg-linear */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-linear-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-3">
                <TicketPercent className="h-8 w-8 md:h-10 md:w-10 text-yellow-300" />
                Ví Voucher
            </h1>
            <p className="text-indigo-100 text-lg">Săn mã giảm giá độc quyền cho chuyến đi của bạn.</p>
        </div>
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Sparkles className="h-64 w-64 text-white transform translate-x-1/3 -translate-y-1/3" />
        </div>
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 mb-4">
                <TicketPercent className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Chưa có mã giảm giá nào</h3>
            <p className="text-gray-500 mt-2">Vui lòng quay lại sau để nhận ưu đãi mới nhất!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thêm type: any cho voucher để fix lỗi TS */}
            {vouchers.map((voucher: any) => (
                <div key={voucher.id} className="group relative flex flex-col sm:flex-row h-auto sm:h-48 bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                    {/* Sửa bg-gradient thành bg-linear */}
                    <div className="relative w-full sm:w-40 bg-linear-to-br from-indigo-600 to-purple-700 text-white p-6 flex flex-col items-center justify-center text-center sm:border-r-2 border-dashed border-white/20">
                        <span className="text-3xl font-black tracking-tighter drop-shadow-md">
                            {voucher.type === "PERCENT" ? `${voucher.discount}%` : `${voucher.discount / 1000}k`}
                        </span>
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded mt-2 uppercase tracking-wide">GIẢM GIÁ</span>
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between relative bg-white">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold border border-indigo-100">{voucher.code}</Badge>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" title="Copy mã"><Copy className="h-4 w-4" /></Button>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-indigo-600 transition-colors">{voucher.description}</h3>
                            <p className="text-sm text-gray-500 mt-2">Đơn tối thiểu: <span className="font-medium text-gray-900">{new Intl.NumberFormat('vi-VN').format(voucher.minSpend)}đ</span></p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mt-4 bg-orange-50 w-fit px-2 py-1 rounded-lg">
                            <Calendar className="h-3 w-3" /> HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}