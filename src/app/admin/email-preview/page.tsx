"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Eye } from "lucide-react";

export default function EmailPreviewPage() {
  const [emailType, setEmailType] = useState<"new" | "existing">("new");

  const sampleDataNew = {
    name: "Nguyễn Văn A",
    hotelName: "Khách sạn Mường Thanh Luxury",
    username: "partner@muongthanh.com",
    password: "Abc123!@#XyZ9876",
    email: "partner@muongthanh.com"
  };

  const sampleDataExisting = {
    name: "Trần Thị B",
    hotelName: "Vinpearl Resort & Spa",
    email: "existing@vinpearl.com"
  };

  const getEmailHTML = (type: "new" | "existing") => {
    if (type === "new") {
      return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Chúc mừng!</h1>
      <p>Đơn đăng ký Partner đã được duyệt</p>
    </div>
    
    <div class="content">
      <p>Xin chào <strong>${sampleDataNew.name}</strong>,</p>
      
      <p>Chúc mừng! Đơn đăng ký đối tác cho khách sạn <strong>"${sampleDataNew.hotelName}"</strong> đã được duyệt thành công.</p>
      
      <p>Chúng tôi đã tạo tài khoản Partner cho bạn với thông tin đăng nhập như sau:</p>
      
      <div class="credentials">
        <h3>🔐 Thông tin đăng nhập</h3>
        <p><strong>URL:</strong> http://localhost:3000/login</p>
        <p><strong>Email:</strong> ${sampleDataNew.username}</p>
        <p><strong>Mật khẩu:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px;">${sampleDataNew.password}</code></p>
      </div>
      
      <div class="warning">
        <strong>⚠️ Quan trọng:</strong> Vui lòng đăng nhập và đổi mật khẩu ngay sau lần đăng nhập đầu tiên để bảo mật tài khoản.
      </div>
      
      <a href="http://localhost:3000/login" class="button">Đăng nhập ngay</a>
      
      <h3>📋 Các bước tiếp theo:</h3>
      <ol>
        <li>Đăng nhập vào hệ thống</li>
        <li>Đổi mật khẩu trong phần Cài đặt</li>
        <li>Thêm thông tin chi tiết về khách sạn</li>
        <li>Đăng các phòng và bắt đầu nhận booking</li>
      </ol>
      
      <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ:</p>
      <ul>
        <li>📞 Hotline: 1900 1234</li>
        <li>📧 Email: partner@luminastay.com</li>
      </ul>
      
      <p>Chúc bạn kinh doanh thành công!</p>
      
      <p>Trân trọng,<br><strong>Lumina Stay Team</strong></p>
    </div>
    
    <div class="footer">
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
      <p>&copy; 2026 Lumina Stay. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `;
    } else {
      return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Chúc mừng!</h1>
      <p>Đơn đăng ký Partner đã được duyệt</p>
    </div>
    
    <div class="content">
      <p>Xin chào <strong>${sampleDataExisting.name}</strong>,</p>
      
      <p>Đơn đăng ký đối tác cho khách sạn <strong>"${sampleDataExisting.hotelName}"</strong> đã được duyệt thành công.</p>
      
      <p>Tài khoản của bạn đã được nâng cấp lên quyền <strong>PARTNER</strong>. Bạn có thể đăng nhập và bắt đầu quản lý khách sạn của mình.</p>
      
      <a href="http://localhost:3000/login" class="button">Đăng nhập ngay</a>
      
      <h3>📋 Các bước tiếp theo:</h3>
      <ol>
        <li>Đăng nhập vào hệ thống</li>
        <li>Thêm thông tin chi tiết về khách sạn</li>
        <li>Đăng các phòng và bắt đầu nhận booking</li>
      </ol>
      
      <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ:</p>
      <ul>
        <li>📞 Hotline: 1900 1234</li>
        <li>📧 Email: partner@luminastay.com</li>
      </ul>
      
      <p>Chúc bạn kinh doanh thành công!</p>
      
      <p>Trân trọng,<br><strong>Lumina Stay Team</strong></p>
    </div>
    
    <div class="footer">
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
      <p>&copy; 2026 Lumina Stay. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Preview</h1>
          <p className="text-sm text-gray-500">Xem trước email gửi cho Partner</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setEmailType("new")}
          variant={emailType === "new" ? "default" : "outline"}
        >
          <Eye className="w-4 h-4 mr-2" />
          Email tài khoản mới
        </Button>
        <Button
          onClick={() => setEmailType("existing")}
          variant={emailType === "existing" ? "default" : "outline"}
        >
          <Eye className="w-4 h-4 mr-2" />
          Email tài khoản cũ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {emailType === "new" 
              ? "📧 Email duyệt đơn (Tài khoản mới - Có thông tin đăng nhập)" 
              : "📧 Email duyệt đơn (Tài khoản đã tồn tại)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>To:</strong> {emailType === "new" ? sampleDataNew.email : sampleDataExisting.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Subject:</strong> {emailType === "new" 
                ? "Chúc mừng! Đơn đăng ký Partner đã được duyệt - Thông tin đăng nhập"
                : "Đơn đăng ký Partner đã được duyệt"}
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            <iframe
              srcDoc={getEmailHTML(emailType)}
              className="w-full h-[600px] border-0"
              title="Email Preview"
            />
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Hướng dẫn demo:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Vào trang <strong>/admin/partner-apps</strong></li>
              <li>Chọn một đơn đăng ký PENDING</li>
              <li>Bấm nút "Duyệt đơn"</li>
              <li>Mở terminal/console để xem email được log ra</li>
              <li>Hoặc vào trang này để xem preview email</li>
            </ol>
          </div>

          {emailType === "new" && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">🔐 Thông tin đăng nhập mẫu:</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Email:</strong> {sampleDataNew.username}</p>
                <p><strong>Password:</strong> <code className="bg-white px-2 py-1 rounded">{sampleDataNew.password}</code></p>
                <p className="text-xs mt-2 text-green-600">
                  * Mật khẩu được tạo tự động và gửi qua email. Partner cần đổi mật khẩu sau lần đăng nhập đầu tiên.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-900">⚙️ Cấu hình Email Service (Production)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800 space-y-3">
          <p>Hiện tại email chỉ được log ra console (development mode). Để gửi email thật trong production:</p>
          
          <div className="bg-white p-3 rounded border border-amber-200">
            <p className="font-semibold mb-2">1. Chọn Email Provider:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Resend</strong> - Đơn giản, dễ setup (Recommended)</li>
              <li><strong>SendGrid</strong> - Phổ biến, nhiều tính năng</li>
              <li><strong>AWS SES</strong> - Rẻ, phù hợp scale lớn</li>
              <li><strong>Mailgun</strong> - Mạnh về deliverability</li>
            </ul>
          </div>

          <div className="bg-white p-3 rounded border border-amber-200">
            <p className="font-semibold mb-2">2. Cài đặt package:</p>
            <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs">
              npm install resend
            </code>
          </div>

          <div className="bg-white p-3 rounded border border-amber-200">
            <p className="font-semibold mb-2">3. Thêm API key vào .env:</p>
            <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs">
              RESEND_API_KEY=re_xxxxxxxxxxxxx
            </code>
          </div>

          <div className="bg-white p-3 rounded border border-amber-200">
            <p className="font-semibold mb-2">4. Uncomment code trong src/lib/email.ts</p>
            <p className="text-xs">File đã có sẵn template HTML, chỉ cần kết nối với provider</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
