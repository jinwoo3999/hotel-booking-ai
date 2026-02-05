import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { HotelSearchResults } from "@/components/hotels/HotelSearchResults";
import { MapPin, Camera, Star, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, 
} from "@/components/ui/dialog";
import Link from "next/link";

// --- DỮ LIỆU GIẢ LẬP ĐỊA ĐIỂM DU LỊCH ---
type Attraction = { name: string; img: string; intro: string };
type CityInfo = { image: string; desc: string; attractions: Attraction[] };

const cityData: Record<string, CityInfo> = {
  "Đà Lạt": {
    image: "https://hoanghamobile.com/tin-tuc/wp-content/webp-express/webp-images/uploads/2024/07/anh-da-lat-2.jpg.webp",
    desc: "Thành phố ngàn hoa với khí hậu ôn hòa quanh năm.",
    attractions: [
      { 
        name: "Quảng trường Lâm Viên", 
        img: "https://www.homepaylater.vn/static/23fb4c28fc2d63e1d98b98c6c09ed702/2917b/3_tham_quan_mien_phi_mo_cua_suot_ngay_dem_a748069559.jpg",
        intro: "Biểu tượng của Đà Lạt với nụ hoa Atiso và hoa Dã Quỳ khổng lồ. Nơi diễn ra các hoạt động vui chơi, hóng gió và check-in không thể bỏ qua." 
      },
      { 
        name: "Hồ Xuân Hương", 
        img: "https://bizweb.dktcdn.net/100/006/093/files/ho-xuan-huong-da-lat-2.jpg?v=1701947652021",
        intro: "Trái tim của thành phố, hồ nước thơ mộng thích hợp để đạp vịt, đi dạo hoặc thưởng thức cà phê ngắm cảnh hoàng hôn cực chill."
      },
      { 
        name: "Đỉnh Langbiang", 
        img: "https://ik.imagekit.io/tvlk/blog/2022/11/khu-du-lich-langbiang-5.jpg",
        intro: "Nóc nhà Đà Lạt, nơi bạn có thể đi xe Jeep lên đỉnh, ngắm toàn cảnh thành phố trong sương mù và nghe kể về chuyện tình chàng K'lang và nàng H'biang."
      },
      { 
        name: "Vườn Hoa Thành Phố", 
        img: "https://static.vinwonders.com/production/vuon-hoa-thanh-pho-da-lat-1.jpg",
        intro: "Nơi quy tụ hàng ngàn loài hoa khoe sắc quanh năm. Một điểm đến lý tưởng cho những ai yêu thiên nhiên và muốn có những bức ảnh rực rỡ."
      },
    ]
  },
  "Nha Trang": {
    image: "https://static.vinwonders.com/production/nha-trang-nightlife-1.jpg",
    desc: "Hòn ngọc viễn đông với bãi biển xanh ngát.",
    attractions: [
      { name: "VinWonders Nha Trang", img: "https://static.vinwonders.com/production/vinwonders-nha-trang-banner-01.jpg", intro: "Công viên giải trí đẳng cấp quốc tế trên đảo Hòn Tre với cáp treo vượt biển, công viên nước và hàng trăm trò chơi cảm giác mạnh." },
      { name: "Tháp Bà Ponagar", img: "https://ik.imagekit.io/tvlk/blog/2022/08/thap-ba-ponagar-nha-trang-1.jpg", intro: "Quần thể kiến trúc Chăm Pa cổ kính nằm trên đồi Cù Lao, nơi thờ nữ thần Po Ina Nagar linh thiêng." },
      { name: "Đảo Hòn Mun", img: "https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2017/08/hon-mun-nha-trang.jpg", intro: "Thiên đường lặn biển với rạn san hô đẹp nhất Việt Nam và làn nước trong vắt nhìn thấy đáy." },
      { name: "Chợ Đầm", img: "https://reviewnhatrang.com/wp-content/uploads/2023/07/cho-dam-nha-trang.jpg", intro: "Khu chợ tròn độc đáo, biểu tượng thương mại của Nha Trang, nơi bạn có thể mua hải sản khô và quà lưu niệm." },
    ]
  },
  "Đà Nẵng": {
    image: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20%C4%91%C3%A0%20n%E1%BA%B5ng/anh-dep-da-nang-thumb.jpg",
    desc: "Thành phố đáng sống nhất Việt Nam.",
    attractions: [
      { name: "Cầu Rồng", img: "https://dulichkhampha24.com/wp-content/uploads/2020/03/cau-rong-da-nang-ve-dem.jpg", intro: "Cây cầu có thiết kế độc đáo hình con rồng, phun lửa và phun nước vào 9h tối thứ 7 và Chủ nhật hàng tuần." },
      { name: "Bà Nà Hills", img: "https://ik.imagekit.io/tvlk/blog/2022/11/ba-na-hills-1.jpg", intro: "Đường lên tiên cảnh với Cầu Vàng nổi tiếng thế giới, Làng Pháp và khí hậu 4 mùa trong 1 ngày." },
      { name: "Biển Mỹ Khê", img: "https://vcdn1-dulich.vnecdn.net/2022/06/03/bien-My-Khe-1-1654246062.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Z6JzF7C7z8Q0qZ7Z6JzF7A", intro: "Một trong 6 bãi biển quyến rũ nhất hành tinh do tạp chí Forbes bình chọn." },
      { name: "Ngũ Hành Sơn", img: "https://danangfantasticity.com/wp-content/uploads/2018/09/danh-thang-ngu-hanh-son-thumbnail.jpg", intro: "Quần thể 5 ngọn núi đá vôi ven biển với nhiều hang động huyền bí và chùa chiền linh thiêng." },
    ]
  },
  "Hà Nội": {
      image: "https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-1.jpg",
      desc: "Thủ đô ngàn năm văn hiến.",
      attractions: [
          { name: "Hồ Gươm", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Thap_Rua.jpg/1200px-Thap_Rua.jpg", intro: "Trái tim của thủ đô với Tháp Rùa cổ kính, cầu Thê Húc đỏ son và đền Ngọc Sơn linh thiêng." },
          { name: "Lăng Bác", img: "https://ik.imagekit.io/tvlk/blog/2022/10/lang-chu-tich-ho-chi-minh-1.jpg", intro: "Nơi an nghỉ vĩnh hằng của Chủ tịch Hồ Chí Minh, biểu tượng của lòng kính yêu dân tộc." },
          { name: "Phố Cổ", img: "https://ik.imagekit.io/tvlk/blog/2022/09/pho-co-ha-noi-1.jpg", intro: "36 phố phường nhộn nhịp, nơi lưu giữ kiến trúc xưa và ẩm thực đường phố tuyệt vời." },
          { name: "Văn Miếu", img: "https://owa.bestprice.vn/images/destinations/uploads/van-mieu-quoc-tu-giam-56a084c718c32.jpg", intro: "Trường đại học đầu tiên của Việt Nam, biểu tượng của truyền thống hiếu học." }
      ]
  }
};

const defaultCityImg = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const session = await auth();
  const params = await props.searchParams; 
  
  const query = (params.q as string) || "";
  const guests = parseInt((params.guests as string) || "1");

  let currentCityData: CityInfo | null = null;
  let cityName = "Kết quả tìm kiếm";

  // Logic xác định thành phố
  for (const city of Object.keys(cityData)) {
    if (query.toLowerCase().includes(city.toLowerCase())) {
      currentCityData = cityData[city];
      cityName = city;
      break;
    }
  }

  // Tìm kiếm Khách sạn
  const hotels = await prisma.hotel.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { city: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ],
      rooms: {
        some: { maxGuests: { gte: guests } }
      }
    },
    include: { 
      rooms: { orderBy: { price: 'asc' }, take: 1 } 
    },
    orderBy: { rating: "desc" },
    take: 10
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* 1. HEADER */}
      <div className="absolute top-0 w-full z-50">
           <ClientSiteHeader session={session as any} className="bg-transparent border-none text-white" />
      </div>

      {/* 2. HERO BANNER */}
      <div className="relative h-[400px] overflow-hidden">
          <img 
            src={currentCityData?.image || defaultCityImg} 
            className="w-full h-full object-cover"
            alt="City Banner"
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-10">
              <Badge className="mb-4 bg-white/20 text-white border-none backdrop-blur-md px-4 py-1 text-sm uppercase tracking-widest">
                  Điểm đến
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-4">
                  {cityName !== "Kết quả tìm kiếm" ? `Khám phá ${cityName}` : `Tìm kiếm: “${query}”`}
              </h1>
              <p className="text-gray-100 text-lg max-w-2xl font-medium drop-shadow-md">
                  {currentCityData?.desc || `Danh sách ${hotels.length} khách sạn tốt nhất dành cho bạn.`}
              </p>
          </div>
      </div>

      <main className="container mx-auto max-w-7xl px-4 py-12 space-y-16">
        
        {/* 3. ĐỊA ĐIỂM DU LỊCH */}
        {currentCityData && (
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <Camera className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Địa điểm không thể bỏ lỡ</h2>
                        <p className="text-gray-500 text-sm">Check-in ngay tại các điểm hot nhất {cityName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {currentCityData.attractions.map((place: Attraction, idx: number) => (
                        <Dialog key={idx}>
                            <DialogTrigger asChild>
                                <div className="group relative h-60 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:-translate-y-1 transition-all duration-300">
                                    <img src={place.img} alt={place.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-4">
                                        <h3 className="text-white font-bold text-lg">{place.name}</h3>
                                        <div className="flex items-center gap-1 text-gray-300 text-xs mt-1">
                                            <MapPin className="h-3 w-3" /> {cityName}
                                        </div>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                                    <div className="relative h-[300px]">
                                        <img src={place.img} className="w-full h-full object-cover" alt={place.name} />
                                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                                            Điểm đến HOT
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">{place.name}</DialogTitle>
                                            <DialogDescription className="text-base text-gray-600 leading-relaxed">
                                                {place.intro}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-6 flex justify-end">
                                             <DialogClose asChild>
                                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                                                    Đóng thông tin
                                                </Button>
                                             </DialogClose>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            </section>
        )}

        {/* 4. TOP 10 KHÁCH SẠN - ĐÃ FIX LỖI LỒNG THẺ LINK */}
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                        <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Khách sạn tại {cityName}</h2>
                        <p className="text-gray-500 text-sm">Tìm thấy {hotels.length} khách sạn phù hợp</p>
                    </div>
                </div>
            </div>

            <HotelSearchResults hotels={hotels} />
        </section>

      </main>
    </div>
  );
}