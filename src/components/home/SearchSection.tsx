"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CalendarDays, MapPin, Users, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const locations = [
  { value: "hanoi", label: "Hà Nội" },
  { value: "hochiminh", label: "TP. Hồ Chí Minh" },
  { value: "danang", label: "Đà Nẵng" },
  { value: "dalat", label: "Đà Lạt" },
  { value: "nhatrang", label: "Nha Trang" },
  { value: "hoian", label: "Hội An" },
  { value: "phuquoc", label: "Phú Quốc" },
  { value: "quynhon", label: "Quy Nhơn" },
  { value: "hue", label: "Huế" },
  { value: "sapa", label: "Sapa" },
  { value: "vungtau", label: "Vũng Tàu" },
];

export function SearchSection() {
  const router = useRouter();
  
  const [openCombobox, setOpenCombobox] = useState(false);
  const [locationValue, setLocationValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [guests, setGuests] = useState(2);

  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    const query = locations.find((l) => l.value === locationValue)?.label || inputValue;
    
    if (query) params.set("q", query);
    if (guests) params.set("guests", guests.toString());
    
    if (date?.from) params.set("from", date.from.toISOString());
    if (date?.to) params.set("to", date.to.toISOString());

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative h-[500px] md:h-[600px] w-full flex items-center justify-center">
      <div className="relative z-10 w-full max-w-5xl px-4 mt-20">
        <div className="text-center mb-8 text-white space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                Khám phá kỳ nghỉ mơ ước
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-medium drop-shadow-md">
                Đặt phòng khách sạn, resort & homestay với giá tốt nhất
            </p>
        </div>

        <form onSubmit={handleSearch} className="bg-black/40 backdrop-blur-2xl border border-white/20 p-4 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-4 items-end animate-in fade-in zoom-in duration-500">
            
            {/* 1. ĐỊA ĐIỂM */}
            <div className="flex-1 space-y-2 w-full">
                <label className="text-xs font-bold text-gray-300 uppercase ml-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3"/> Bạn muốn đi đâu?
                </label>
                
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full h-14 justify-between rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white text-lg font-medium"
                    >
                      {locationValue
                        ? locations.find((l) => l.value === locationValue)?.label
                        : (inputValue || "Tìm thành phố, khách sạn...")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 rounded-xl bg-white text-black" align="start">
                    <Command shouldFilter={false}> 
                      <CommandInput 
                        placeholder="Nhập tên điểm đến..." 
                        value={inputValue}
                        onValueChange={(val) => {
                            setInputValue(val);
                            if(val !== locationValue) setLocationValue("");
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>Nhấn Enter để tìm “{inputValue}”</CommandEmpty>
                        <CommandGroup heading="Địa điểm phổ biến">
                          {locations.map((framework) => (
                            <CommandItem
                              key={framework.value}
                              value={framework.value}
                              onSelect={(currentValue) => {
                                setLocationValue(currentValue === locationValue ? "" : currentValue);
                                setInputValue(framework.label);
                                setOpenCombobox(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  locationValue === framework.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {framework.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>

            {/* 2. CHỌN NGÀY */}
            <div className="flex-1 space-y-2 w-full md:w-auto">
                <label className="text-xs font-bold text-gray-300 uppercase ml-1 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3"/> Ngày nhận - trả phòng
                </label>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full h-14 justify-start text-left font-medium rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white focus:border-white/50",
                        !date && "text-gray-400"
                      )}
                    >
                      <CalendarDays className="mr-2 h-5 w-5 text-gray-400" />
                      {date?.from ? (
                        date.to ? (
                          <span className="text-lg truncate text-white">
                            {format(date.from, "dd/MM", { locale: vi })} -{" "}
                            {format(date.to, "dd/MM", { locale: vi })}
                          </span>
                        ) : (
                          <span className="text-lg truncate text-white">
                             {format(date.from, "dd/MM", { locale: vi })}
                          </span>
                        )
                      ) : (
                        <span>Chọn ngày đi - về</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  
                  <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50" align="center">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={1}
                      locale={vi}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today; 
                      }}
                      className="text-white p-4 pointer-events-auto" 
                      classNames={{
                        day_selected: "bg-indigo-600 text-white hover:bg-indigo-600 focus:bg-indigo-600 rounded-md",
                        day_today: "bg-white/20 text-white font-bold rounded-md",
                        day: "h-10 w-10 p-0 font-normal text-gray-100 hover:bg-white/20 rounded-md transition-all aria-selected:opacity-100 cursor-pointer",
                        day_outside: "text-gray-500 opacity-50",
                        day_disabled: "text-gray-600 opacity-30 cursor-not-allowed line-through",
                        caption: "flex justify-center pt-1 relative items-center text-white font-bold mb-2",
                        nav_button: "border border-white/20 hover:bg-white/20 text-white rounded-lg p-1 transition-colors",
                      }}
                    />
                  </PopoverContent>
                </Popover>
            </div>

             {/* 3. SỐ KHÁCH */}
             <div className="w-full md:w-48 space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase ml-1 flex items-center gap-1">
                    <Users className="h-3 w-3"/> Khách
                </label>
                <div className="relative group">
                    <Input 
                        type="number" 
                        min={1} 
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                        className="h-14 pl-10 rounded-xl font-medium border-white/20 bg-white/5 text-white focus:bg-white/10 focus:border-white/50" 
                    />
                    <Users className="absolute left-3 top-4 h-6 w-6 text-gray-400 group-focus-within:text-white transition-colors" />
                </div>
            </div>

            <Button 
                size="lg" 
                type="submit"
                className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 border border-indigo-400/50 w-full md:w-auto"
            >
                <Search className="mr-2 h-5 w-5" /> Tìm kiếm
            </Button>
        </form>
      </div>
    </section>
  );
}