import { FeaturedRooms } from "@/features/booking/components/FeaturedRooms"; // Server Component (Prisma)
import { LoyaltySection } from "@/features/user/components/LoyaltySection"; // Client Component
import { DashboardHero } from "./components/DashboardHero"; // Client Component vừa tạo
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock Data
const TRENDING_CITIES = [
  { id: 1, name: "Đà Lạt", season: "Tháng 1 - 3", description: "Mùa mai anh đào nở rộ.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80", price: "Từ 500k" },
  { id: 2, name: "Phú Quốc", season: "Mùa khô", description: "Biển xanh nắng vàng.", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80", price: "Từ 1.2tr" },
  { id: 3, name: "Sapa", season: "Săn mây", description: "Đỉnh Fansipan sương mù.", image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&q=80", price: "Từ 800k" },
  { id: 4, name: "Hội An", season: "Lễ hội", description: "Đèn lồng phố cổ.", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80", price: "Từ 600k" }
];

const TRAVEL_NEWS = [
  { id: 1, title: "Top 10 Homestay view núi đẹp", category: "Review", date: "19/01/2026", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80" },
  { id: 2, title: "Kinh nghiệm du lịch Thái Lan", category: "Cẩm nang", date: "15/01/2026", image: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80" },
  { id: 3, title: "Vé máy bay Tết 2026", category: "Tin tức", date: "10/01/2026", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80" }
];

// ❌ KHÔNG ĐƯỢC CÓ "use client" Ở ĐÂY
export default function Homepage() {
  return (
    <div className="space-y-12 pb-10">
      
      {/* 1. Phần Hero (Đã tách ra Client Component) */}
      <DashboardHero />

      {/* 2. Phần Loyalty (Client Component) */}
      <section><LoyaltySection /></section>

      {/* 3. Trending Cities (Tĩnh - Render Server OK) */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Điểm đến thịnh hành</h2>
            <Button variant="ghost" className="text-indigo-600">Xem thêm &rarr;</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRENDING_CITIES.map((city) => (
                <div key={city.id} className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={city.image} alt={city.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
                        <Badge className="w-fit mb-2 bg-indigo-500/90 border-none">{city.season}</Badge>
                        <h3 className="text-xl font-bold mb-1">{city.name}</h3>
                        <p className="text-sm text-gray-300 line-clamp-2">{city.description}</p>
                        <p className="mt-2 font-semibold text-indigo-300">{city.price}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 4. Featured Rooms - Server Component (Async/Prisma) */}
      {/* Đây chính là chỗ gây lỗi cũ, giờ sẽ chạy ngon vì file cha không còn "use client" */}
      <FeaturedRooms />

      {/* 5. News */}
      <section className="bg-gray-50 rounded-3xl p-8 -mx-4 md:mx-0">
         <h2 className="text-2xl font-bold text-gray-900 mb-6">Cảm hứng du lịch</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRAVEL_NEWS.map((news) => (
                <div key={news.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs font-normal">{news.category}</Badge>
                            <span className="text-xs text-muted-foreground">{news.date}</span>
                        </div>
                        <h3 className="font-bold text-lg leading-snug mb-2 hover:text-indigo-600 cursor-pointer">{news.title}</h3>
                    </div>
                </div>
            ))}
         </div>
      </section>
    </div>
  );
}