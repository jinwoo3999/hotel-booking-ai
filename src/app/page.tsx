import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { auth } from "@/auth";
import { SearchSection } from "@/components/home/SearchSection";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, TrendingUp, Star } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // 1. LẤY KHÁCH SẠN HOT TỪ DB
  const featuredHotels = await prisma.hotel.findMany({
    where: { status: 'ACTIVE' },
    take: 8,
    orderBy: { rating: 'desc' },
    include: { rooms: { orderBy: { price: 'asc' }, take: 1 } }
  });

  // Data mẫu địa điểm
  const destinations = [
    { 
      name: "Đà Lạt", 
      img: "https://hoanghamobile.com/tin-tuc/wp-content/webp-express/webp-images/uploads/2024/07/anh-da-lat-2.jpg.webp", 
      count: "1,203 chỗ nghỉ" 
    },
    { 
      name: "Nha Trang", 
      img: "https://static.vinwonders.com/production/nha-trang-nightlife-1.jpg", 
      count: "840 chỗ nghỉ" 
    },
    { 
      name: "Đà Nẵng", 
      img: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20%C4%91%C3%A0%20n%E1%BA%B5ng/anh-dep-da-nang-thumb.jpg", 
      count: "2,050 chỗ nghỉ" 
    },
    { 
      name: "Hà Nội", 
      img: "https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-1.jpg", 
      count: "1,560 chỗ nghỉ" 
    },
  ];

  const videoUrl = "https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4";

  return (
    <div className="relative min-h-screen font-sans selection:bg-indigo-500 selection:text-white overflow-hidden text-white">
      
      {/* 1. NỀN VIDEO */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-gray-900">
          <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-100">
              <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" /> 
      </div>

      <ClientSiteHeader session={session as any} />
      
      <main className="relative z-10 space-y-24 pb-20">
        
        {/* HERO SECTION */}
        <div className="pt-10">
            <SearchSection />
        </div>

        {/* 2. ĐIỂM ĐẾN NỔI BẬT (ĐÃ THÊM LINK CLICK ĐƯỢC) */}
        <section className="container mx-auto px-4">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-8 inline-block w-full">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <Badge className="mb-3 bg-indigo-500 hover:bg-indigo-600 text-white border-none px-3 py-1">
                            <TrendingUp className="w-3 h-3 mr-1"/> Xu hướng 2026
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white shadow-black drop-shadow-md">
                            Điểm đến nổi bật
                        </h2>
                        <p className="text-gray-200 mt-2 text-lg font-medium">Những nơi được du khách săn đón nhiều nhất</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {destinations.map((dest, idx) => (
                    // --- ĐÃ BỌC THẺ LINK VÀO ĐÂY ---
                    <Link key={idx} href={`/search?q=${dest.name}`}>
                        <div className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/20">
                            <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="font-bold text-2xl mb-1 text-white">{dest.name}</h3>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md">
                                    <MapPin className="h-3 w-3 text-white" /> 
                                    </div>
                                    {dest.count}
                                </div>
                            </div>
                        </div>
                    </Link>
                    // -------------------------------
                ))}
            </div>
        </section>

        {/* 3. KHÁCH SẠN YÊU THÍCH (LẤY TỪ DB) */}
        <section className="container mx-auto px-4">
             <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-3 drop-shadow-md">
                        Khách sạn được yêu thích <Sparkles className="h-6 w-6 text-yellow-400 fill-yellow-400"/>
                    </h2>
                    <p className="text-gray-200 mt-2 text-lg">Trải nghiệm nghỉ dưỡng đẳng cấp với giá tốt nhất</p>
                </div>
                <Link href="/search">
                    <Button className="hidden md:flex gap-2 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl">
                        Xem tất cả <ArrowRight className="h-4 w-4"/>
                    </Button>
                </Link>
            </div>

            {featuredHotels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredHotels.map((hotel) => (
                        <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="group block h-full">
                             <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:-translate-y-2 transition-all duration-300">
                                {/* IMAGE */}
                                <div className="relative h-64 w-full overflow-hidden">
                                  <img
                                    src={hotel.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945"}
                                    alt={hotel.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  />
                                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 text-gray-900">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {hotel.rating}
                                  </div>
                                </div>

                                {/* CONTENT */}
                                <div className="p-5">
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3"/> {hotel.city}
                                    </div>
                                    <h3 className="font-bold text-xl text-gray-900 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {hotel.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                        {hotel.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-400">Giá chỉ từ</p>
                                            <p className="text-lg font-black text-indigo-600">
                                                {hotel.rooms.length > 0 
                                                    ? Math.min(...hotel.rooms.map(r => r.price)).toLocaleString() 
                                                    : "Liên hệ"}đ
                                                <span className="text-xs text-gray-400 font-normal"> / đêm</span>
                                            </p>
                                        </div>
                                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">Đặt ngay</Button>
                                    </div>
                                </div>
                             </div>
                        </Link>
                    ))}
                </div>
            ) : (
                // HIỂN THỊ KHI CHƯA CÓ DỮ LIỆU
                <div className="text-center py-20 bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 border-dashed">
                    <p className="text-white font-bold text-lg">Chưa có dữ liệu khách sạn</p>
                    <p className="text-gray-300 text-sm mt-1">Vui lòng vào Admin để thêm khách sạn mới.</p>
                </div>
            )}
        </section>

        {/* BANNER ĐỐI TÁC */}
        <section className="container mx-auto px-4">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 h-[350px] md:h-[450px] flex items-center group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2000')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"></div>
                 <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                 <div className="relative z-10 px-8 md:px-20 max-w-3xl">
                     <Badge className="bg-yellow-400 text-black font-extrabold mb-6 px-4 py-1.5 text-sm uppercase tracking-wider shadow-lg shadow-yellow-400/20 border-none">
                        Cơ hội kinh doanh
                     </Badge>
                     <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8 drop-shadow-xl">
                        Bạn có căn hộ trống? <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Hợp tác cùng Lumina!</span>
                     </h2>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold text-lg rounded-2xl h-14 px-8 shadow-xl transition-transform hover:-translate-y-1">
                            Đăng ký đối tác
                        </Button>
                     </div>
                 </div>
            </div>
        </section>
      </main>

      <footer className="relative z-10 bg-black/60 backdrop-blur-xl border-t border-white/10 py-12">
        <div className="container mx-auto px-4 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">L</div>
                <span className="font-extrabold text-2xl text-white">Lumina Stay</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">© 2026 Lumina Inc. Mang cả thế giới đến tầm tay bạn.</p>
        </div>
      </footer>
    </div>
  );
}