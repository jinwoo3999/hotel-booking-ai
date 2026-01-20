"use client";

import { useState } from "react"; 
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, CalendarDays, Plane, Car, Hotel, Search } from "lucide-react";
import { toast } from "sonner";

export function DashboardHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  // Hàm xử lý khi bấm Tìm kiếm
  const handleSearch = () => {
    if (!query.trim()) {
      toast.error("Vui lòng nhập địa điểm hoặc tên phòng");
      return;
    }
    // Chuyển hướng sang trang tìm kiếm kèm tham số
    const params = new URLSearchParams();
    params.set("q", query);
    if (date) params.set("date", date);
    
    router.push(`/dashboard/search?${params.toString()}`);
  };

  return (
    <section className="relative rounded-3xl overflow-hidden bg-indigo-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-40">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80" alt="Bg" className="w-full h-full object-cover"/>
        </div>
        <div className="relative z-10 px-8 py-16 md:py-24 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Khám phá thế giới cùng <span className="text-indigo-300">AI</span></h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">Đặt phòng, vé máy bay và xe đưa đón trọn gói.</p>
          
          <div className="bg-white p-4 rounded-2xl shadow-2xl max-w-3xl mx-auto text-gray-900">
            <Tabs defaultValue="hotel" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="hotel" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"><Hotel className="h-4 w-4"/>Khách sạn</TabsTrigger>
                <TabsTrigger value="flight" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"><Plane className="h-4 w-4"/>Máy bay</TabsTrigger>
                <TabsTrigger value="car" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"><Car className="h-4 w-4"/>Xe đưa đón</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hotel" className="flex flex-col md:flex-row gap-3">
                 <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                    {/*  Input nhập từ khóa */}
                    <Input 
                        placeholder="Bạn muốn đi đâu? (VD: Suite, Đà Nẵng...)" 
                        className="pl-10 h-12 text-base border-gray-200"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                 </div>
                 <div className="relative flex-1">
                    <CalendarDays className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                    {/*  Input nhập ngày */}
                    <Input 
                        type="date" 
                        className="pl-10 h-12 text-base border-gray-200"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                 </div>
                 <Button onClick={handleSearch} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold">
                    <Search className="mr-2 h-5 w-5" /> Tìm kiếm
                 </Button>
              </TabsContent>
              
              <TabsContent value="flight"><div className="p-4 text-center text-gray-500 bg-gray-50 border border-dashed rounded-lg">Tính năng đang cập nhật...</div></TabsContent>
              <TabsContent value="car"><div className="p-4 text-center text-gray-500 bg-gray-50 border border-dashed rounded-lg">Tính năng đang phát triển...</div></TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
  );
}