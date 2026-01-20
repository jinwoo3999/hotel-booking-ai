import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DoorOpen, TrendingUp } from "lucide-react";

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12.500.000₫</div>
          <p className="text-xs text-muted-foreground">
            +20% so với tháng trước
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Phòng đang thuê</CardTitle>
          <DoorOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1</div>
          <p className="text-xs text-muted-foreground">
            Check-out: 14:00 hôm nay
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Điểm thưởng</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">2,350</div>
          <p className="text-xs text-muted-foreground">
            Hạng: Vàng (Gold)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}