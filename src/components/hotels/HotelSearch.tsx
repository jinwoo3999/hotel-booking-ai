"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users } from "lucide-react";

export default function HotelSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchData, setSearchData] = useState({
    city: searchParams.get('city') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '2'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tạo URL params cho tìm kiếm
    const params = new URLSearchParams();
    if (searchData.city) params.set('city', searchData.city);
    if (searchData.checkIn) params.set('checkIn', searchData.checkIn);
    if (searchData.checkOut) params.set('checkOut', searchData.checkOut);
    if (searchData.guests) params.set('guests', searchData.guests);
    
    // Chuyển hướng đến trang tìm kiếm với params
    router.push(`/hotels?${params.toString()}`);
  };

  return (
    <div className="bg-indigo-900 rounded-3xl p-8 md:p-12 text-center text-white mb-12 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000')] bg-cover opacity-20"></div>
      <div className="relative z-10">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Tìm điểm dừng chân hoàn hảo</h1>
        <p className="text-indigo-200 mb-8 text-lg">Khám phá hàng trăm khách sạn đẳng cấp với giá tốt nhất.</p>
        
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden md:flex bg-white p-2 rounded-2xl shadow-2xl gap-2">
            <div className="flex-1 flex items-center px-4 border-r">
              <MapPin className="text-gray-400 w-5 h-5 mr-2"/>
              <Input 
                className="border-none shadow-none focus-visible:ring-0 text-gray-900" 
                placeholder="Thành phố, địa điểm..." 
                value={searchData.city}
                onChange={(e) => setSearchData({...searchData, city: e.target.value})}
              />
            </div>
            
            <div className="flex items-center px-4 border-r">
              <Calendar className="text-gray-400 w-5 h-5 mr-2"/>
              <Input 
                type="date" 
                className="border-none shadow-none focus-visible:ring-0 text-gray-900 w-32"
                value={searchData.checkIn}
                onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
              />
            </div>
            
            <div className="flex items-center px-4 border-r">
              <Calendar className="text-gray-400 w-5 h-5 mr-2"/>
              <Input 
                type="date" 
                className="border-none shadow-none focus-visible:ring-0 text-gray-900 w-32"
                value={searchData.checkOut}
                onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
              />
            </div>
            
            <div className="flex items-center px-4 border-r">
              <Users className="text-gray-400 w-5 h-5 mr-2"/>
              <select 
                className="border-none bg-transparent text-gray-900 focus:outline-none"
                value={searchData.guests}
                onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
              >
                <option value="1">1 khách</option>
                <option value="2">2 khách</option>
                <option value="3">3 khách</option>
                <option value="4">4 khách</option>
                <option value="5">5+ khách</option>
              </select>
            </div>
            
            <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 font-bold h-12">
              <Search className="w-4 h-4 mr-2"/> Tìm kiếm
            </Button>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <div className="flex items-center mb-4">
                <MapPin className="text-gray-400 w-5 h-5 mr-2"/>
                <Input 
                  className="border-none shadow-none focus-visible:ring-0 text-gray-900" 
                  placeholder="Thành phố, địa điểm..." 
                  value={searchData.city}
                  onChange={(e) => setSearchData({...searchData, city: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <Calendar className="text-gray-400 w-4 h-4 mr-2"/>
                  <Input 
                    type="date" 
                    className="border-none shadow-none focus-visible:ring-0 text-gray-900 text-sm"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center">
                  <Calendar className="text-gray-400 w-4 h-4 mr-2"/>
                  <Input 
                    type="date" 
                    className="border-none shadow-none focus-visible:ring-0 text-gray-900 text-sm"
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <Users className="text-gray-400 w-5 h-5 mr-2"/>
                <select 
                  className="border-none bg-transparent text-gray-900 focus:outline-none w-full"
                  value={searchData.guests}
                  onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                >
                  <option value="1">1 khách</option>
                  <option value="2">2 khách</option>
                  <option value="3">3 khách</option>
                  <option value="4">4 khách</option>
                  <option value="5">5+ khách</option>
                </select>
              </div>
              
              <Button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold h-12">
                <Search className="w-4 h-4 mr-2"/> Tìm kiếm
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}