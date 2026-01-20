"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Star } from "lucide-react";
import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { cn, formatCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface BookingFormProps {
  pricePerNight: number;
}

export function BookingForm({ pricePerNight }: BookingFormProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });

  const nights = date?.from && date?.to 
    ? Math.max(1, Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const totalPrice = nights * pricePerNight;
  const serviceFee = totalPrice * 0.05;
  const finalTotal = totalPrice + serviceFee;

  return (
    <Card className="shadow-lg border-indigo-100 sticky top-24">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-2xl font-bold text-indigo-600">{formatCurrency(pricePerNight)}</span>
            <span className="text-muted-foreground text-sm"> / đêm</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            4.9 (128 đánh giá)
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Nhận phòng - Trả phòng</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM", { locale: vi })} -{" "}
                      {format(date.to, "dd/MM", { locale: vi })}
                    </>
                  ) : (
                    format(date.from, "dd/MM", { locale: vi })
                  )
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Số lượng khách</label>
          <Select defaultValue="2">
            <SelectTrigger>
              <SelectValue placeholder="Chọn số khách" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Khách</SelectItem>
              <SelectItem value="2">2 Khách</SelectItem>
              <SelectItem value="3">3 Khách (Thêm giường phụ)</SelectItem>
              <SelectItem value="4">4 Khách</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {nights > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm mt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{formatCurrency(pricePerNight)} x {nights} đêm</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí dịch vụ (5%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base text-indigo-900">
              <span>Tổng cộng</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
          Đặt phòng ngay
        </Button>
      </CardFooter>
    </Card>
  );
}