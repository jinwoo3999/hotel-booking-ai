import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageCircle, Sparkles, Zap, Heart, Star } from "lucide-react";
import QuickActionCard from "@/components/ai/QuickActionCard";

export default async function AIAssistantPage() {
  const session = await auth();

  // Lấy một số thống kê để hiển thị
  const [hotelCount, voucherCount] = await Promise.all([
    prisma.hotel.count({ where: { status: "ACTIVE" } }),
    prisma.voucher.count({ where: { endDate: { gte: new Date() } } }),
  ]);
  
  const conversationCount = 0; // Tạm thời set = 0

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6 text-indigo-600" />,
      title: "Tư vấn thông minh",
      description: "AI hiểu nhu cầu và gợi ý khách sạn phù hợp nhất với bạn"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Tìm kiếm nhanh",
      description: "Chỉ cần mô tả mong muốn, AI sẽ tìm ngay kết quả tốt nhất"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: "Hỗ trợ 24/7",
      description: "Luôn sẵn sàng giúp đỡ bất cứ lúc nào bạn cần"
    },
    {
      icon: <Star className="w-6 h-6 text-purple-600" />,
      title: "Cá nhân hóa",
      description: "Học hỏi sở thích để đưa ra gợi ý ngày càng chính xác"
    }
  ];

  const quickActions = [
    "Tìm khách sạn Đà Lạt giá dưới 2 triệu",
    "Phòng view biển Đà Nẵng cuối tuần",
    "Khách sạn gần sân bay Nội Bài",
    "Resort có hồ bơi Phú Quốc",
    "Voucher giảm giá tháng này",
    "Khách sạn phù hợp gia đình có trẻ nhỏ"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b">
        <ClientSiteHeader session={session as any} />
      </div>

      <main className="container mx-auto max-w-6xl px-4 py-12">
        
        {/* HERO SECTION */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Trợ lý AI <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Lumina</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Trải nghiệm đặt phòng thông minh với AI hiểu biết sâu sắc về nhu cầu của bạn. 
            Chỉ cần nói, AI sẽ tìm và gợi ý những lựa chọn tuyệt vời nhất.
          </p>

          {/* STATS */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{hotelCount}+</div>
              <div className="text-sm text-gray-600">Khách sạn</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{voucherCount}</div>
              <div className="text-sm text-gray-600">Voucher</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{conversationCount}</div>
              <div className="text-sm text-gray-600">Cuộc trò chuyện</div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-16">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Thử ngay với AI
            </CardTitle>
            <p className="text-gray-600">Nhấp vào câu hỏi bên dưới hoặc mở chat để bắt đầu trò chuyện</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} action={action} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng trải nghiệm?</h2>
            <p className="text-indigo-100 mb-6 text-lg">
              Nhấp vào biểu tượng chat ở góc dưới để bắt đầu cuộc trò chuyện với AI
            </p>
            <div className="flex items-center justify-center gap-2 text-indigo-200">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Hoặc thử các câu hỏi mẫu ở trên</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}