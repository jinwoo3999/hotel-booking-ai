import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Phone, Clock, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default async function PartnerApplicationSuccessPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSiteHeader session={session as any} className="bg-white sticky top-0 border-b z-40" />

      <main className="container mx-auto max-w-4xl px-4 py-16">
        
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Đơn đăng ký đã được gửi thành công!
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cảm ơn bạn đã quan tâm đến việc trở thành đối tác của Lumina Stay. 
            Chúng tôi sẽ xem xét đơn đăng ký và liên hệ với bạn trong thời gian sớm nhất.
          </p>
        </div>

        {/* Next Steps */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* What's Next */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Các bước tiếp theo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-medium">Xem xét hồ sơ</div>
                    <div className="text-sm text-gray-600">Đội ngũ của chúng tôi sẽ xem xét đơn đăng ký trong vòng 1-2 ngày làm việc</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-medium">Liên hệ xác nhận</div>
                    <div className="text-sm text-gray-600">Chúng tôi sẽ gọi điện hoặc gửi email để xác nhận thông tin</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-medium">Ký hợp đồng</div>
                    <div className="text-sm text-gray-600">Thỏa thuận điều khoản và ký hợp đồng hợp tác</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <div className="font-medium">Bắt đầu kinh doanh</div>
                    <div className="text-sm text-gray-600">Đăng khách sạn lên hệ thống và bắt đầu nhận booking</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div className="font-medium text-blue-900">Hotline Partner</div>
                  </div>
                  <div className="text-blue-800 font-bold text-lg">1900 1234</div>
                  <div className="text-sm text-blue-700">Miễn phí - Hỗ trợ 24/7</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    <div className="font-medium text-green-900">Email hỗ trợ</div>
                  </div>
                  <div className="text-green-800 font-bold">partner@luminastay.com</div>
                  <div className="text-sm text-green-700">Phản hồi trong 24h</div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Lưu ý:</strong> Vui lòng kiểm tra email (bao gồm cả thư mục spam) 
                    để nhận thông báo cập nhật về trạng thái đơn đăng ký của bạn.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Câu hỏi thường gặp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="font-medium mb-2">Mất bao lâu để được duyệt?</div>
                <div className="text-sm text-gray-600 mb-4">
                  Thông thường từ 1-2 ngày làm việc. Trong trường hợp cần thêm thông tin, 
                  chúng tôi sẽ liên hệ trực tiếp với bạn.
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-2">Tôi có thể chỉnh sửa thông tin đã gửi?</div>
                <div className="text-sm text-gray-600 mb-4">
                  Vui lòng liên hệ hotline 1900 1234 hoặc email để được hỗ trợ 
                  chỉnh sửa thông tin nếu cần thiết.
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-2">Chi phí tham gia như thế nào?</div>
                <div className="text-sm text-gray-600 mb-4">
                  Hoàn toàn miễn phí tham gia. Bạn chỉ trả hoa hồng khi có booking thành công 
                  từ khách hàng trên hệ thống.
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-2">Tôi cần chuẩn bị gì sau khi được duyệt?</div>
                <div className="text-sm text-gray-600 mb-4">
                  Hình ảnh khách sạn chất lượng cao, thông tin chi tiết về phòng và dịch vụ, 
                  giấy tờ pháp lý đầy đủ.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/become-partner">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Quay lại trang đăng ký
              </Button>
            </Link>
            
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Về trang chủ
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            Cảm ơn bạn đã tin tưởng và lựa chọn Lumina Stay làm đối tác kinh doanh!
          </p>
        </div>
      </main>
    </div>
  );
}