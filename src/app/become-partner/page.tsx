import { auth } from "@/auth";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  Headphones, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Building,
  MapPin,
  Phone,
  Mail,
  User
} from "lucide-react";
import { submitPartnerApplication } from "@/lib/actions";

export default async function BecomePartnerPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSiteHeader session={session as any} className="bg-white sticky top-0 border-b z-40" />

      <main className="container mx-auto max-w-6xl px-4 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Hotel className="w-4 h-4" />
            Trở thành Đối tác OTA
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Đưa khách sạn của bạn lên <span className="text-indigo-600">Lumina Stay</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Tham gia mạng lưới đối tác hàng đầu Việt Nam. Tiếp cận hàng triệu khách hàng tiềm năng và tăng doanh thu khách sạn của bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Miễn phí đăng ký
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Hoa hồng cạnh tranh
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Hỗ trợ 24/7
            </span>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Tăng Doanh Thu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Tiếp cận hàng triệu khách hàng trên toàn quốc. Tăng tỷ lệ lấp đầy phòng lên đến 40%.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Thanh Toán Đảm Bảo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Hệ thống thanh toán an toàn, minh bạch. Nhận tiền nhanh chóng sau khi khách check-out.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Hỗ Trợ Chuyên Nghiệp</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Đội ngũ hỗ trợ 24/7, training miễn phí và công cụ quản lý hiện đại.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-indigo-600 rounded-2xl p-8 mb-16 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Tại sao chọn Lumina Stay?</h2>
            <p className="text-indigo-100">Những con số ấn tượng từ đối tác của chúng tôi</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">1M+</div>
              <div className="text-indigo-100">Khách hàng tiềm năng</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-indigo-100">Đối tác khách sạn</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-indigo-100">Tỷ lệ hài lòng</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-indigo-100">Hỗ trợ khách hàng</div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Đăng Ký Trở Thành Đối Tác</CardTitle>
              <p className="text-gray-600">Điền thông tin để chúng tôi liên hệ và hỗ trợ bạn</p>
            </CardHeader>
            <CardContent>
              <form action="/api/partner-application" method="POST" className="space-y-6">
                
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Thông tin liên hệ
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên *</Label>
                      <Input id="fullName" name="fullName" placeholder="Nguyễn Văn A" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Chức vụ</Label>
                      <Input id="position" name="position" placeholder="Giám đốc, Quản lý..." />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" placeholder="contact@hotel.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input id="phone" name="phone" placeholder="0123456789" required />
                    </div>
                  </div>
                </div>

                {/* Hotel Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Thông tin khách sạn
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hotelName">Tên khách sạn *</Label>
                    <Input id="hotelName" name="hotelName" placeholder="Khách sạn ABC" required />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Thành phố *</Label>
                      <Input id="city" name="city" placeholder="Hà Nội, TP.HCM, Đà Nẵng..." required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomCount">Số phòng</Label>
                      <Input id="roomCount" name="roomCount" type="number" placeholder="50" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ chi tiết *</Label>
                    <Input id="address" name="address" placeholder="123 Đường ABC, Quận XYZ" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (nếu có)</Label>
                    <Input id="website" name="website" placeholder="https://hotel.com" />
                  </div>
                </div>

                {/* Business Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Thông tin kinh doanh
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessLicense">Số giấy phép kinh doanh</Label>
                      <Input id="businessLicense" name="businessLicense" placeholder="0123456789" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxCode">Mã số thuế</Label>
                      <Input id="taxCode" name="taxCode" placeholder="0123456789" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả về khách sạn</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="Giới thiệu về khách sạn, dịch vụ, tiện ích..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Kinh nghiệm trong ngành</Label>
                    <select 
                      id="experience" 
                      name="experience"
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Chọn kinh nghiệm</option>
                      <option value="new">Mới bắt đầu (dưới 1 năm)</option>
                      <option value="1-3">1-3 năm</option>
                      <option value="3-5">3-5 năm</option>
                      <option value="5+">Trên 5 năm</option>
                    </select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú thêm</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Câu hỏi hoặc yêu cầu đặc biệt..."
                    rows={3}
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input type="checkbox" id="terms" name="terms" required className="mt-1" />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    Tôi đồng ý với <a href="#" className="text-indigo-600 hover:underline">Điều khoản dịch vụ</a> và 
                    <a href="#" className="text-indigo-600 hover:underline"> Chính sách bảo mật</a> của Lumina Stay.
                  </label>
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-semibold">
                  Gửi Đơn Đăng Ký
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Sidebar */}
          <div className="space-y-6">
            
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Liên hệ trực tiếp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="font-medium">Hotline Partner</div>
                    <div className="text-sm text-gray-600">1900 1234 (miễn phí)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="font-medium">Email hỗ trợ</div>
                    <div className="text-sm text-gray-600">partner@luminastay.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="font-medium">Văn phòng</div>
                    <div className="text-sm text-gray-600">123 Nguyễn Huệ, Q1, TP.HCM</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process */}
            <Card>
              <CardHeader>
                <CardTitle>Quy trình đăng ký</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <div className="font-medium">Gửi đơn đăng ký</div>
                      <div className="text-sm text-gray-600">Điền form và gửi thông tin</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <div className="font-medium">Xét duyệt hồ sơ</div>
                      <div className="text-sm text-gray-600">1-2 ngày làm việc</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <div className="font-medium">Ký hợp đồng</div>
                      <div className="text-sm text-gray-600">Thỏa thuận điều khoản</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <div className="font-medium">Bắt đầu kinh doanh</div>
                      <div className="text-sm text-gray-600">Đăng khách sạn và nhận booking</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Câu hỏi thường gặp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium mb-1">Chi phí tham gia?</div>
                  <div className="text-sm text-gray-600">Hoàn toàn miễn phí. Chỉ trả hoa hồng khi có booking thành công.</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Hoa hồng bao nhiêu?</div>
                  <div className="text-sm text-gray-600">Từ 10-15% tùy theo loại phòng và chính sách của khách sạn.</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Khi nào nhận tiền?</div>
                  <div className="text-sm text-gray-600">Thanh toán trong vòng 7 ngày sau khi khách check-out.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}