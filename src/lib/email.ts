/**
 * Email Service
 * Hiện tại log ra console, có thể tích hợp SendGrid/AWS SES/Resend sau
 */

export interface PartnerApprovalEmailData {
  email: string;
  name: string;
  hotelName: string;
  username: string;
  password: string;
}

export interface PartnerApprovalExistingEmailData {
  email: string;
  name: string;
  hotelName: string;
}

export async function sendPartnerApprovalEmail(data: PartnerApprovalEmailData) {
  // TODO: Tích hợp email service thật (SendGrid, AWS SES, Resend, etc.)
  
  const emailContent = `
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
      <p>Xin chào <strong>${data.name}</strong>,</p>
      
      <p>Chúc mừng! Đơn đăng ký đối tác cho khách sạn <strong>"${data.hotelName}"</strong> đã được duyệt thành công.</p>
      
      <p>Chúng tôi đã tạo tài khoản Partner cho bạn với thông tin đăng nhập như sau:</p>
      
      <div class="credentials">
        <h3>🔐 Thông tin đăng nhập</h3>
        <p><strong>URL:</strong> http://localhost:3000/login</p>
        <p><strong>Email:</strong> ${data.username}</p>
        <p><strong>Mật khẩu:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px;">${data.password}</code></p>
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

  // Log ra console (development)
  console.log("\n📧 ===== EMAIL DUYỆT ĐƠN PARTNER (TÀI KHOẢN MỚI) =====");
  console.log(`To: ${data.email}`);
  console.log(`Subject: Chúc mừng! Đơn đăng ký Partner đã được duyệt - Thông tin đăng nhập`);
  console.log("\n--- Thông tin đăng nhập ---");
  console.log(`Email: ${data.username}`);
  console.log(`Password: ${data.password}`);
  console.log(`Hotel: ${data.hotelName}`);
  console.log("=====================================\n");

  // TODO: Gửi email thật
  // await sendEmail({
  //   to: data.email,
  //   subject: "Chúc mừng! Đơn đăng ký Partner đã được duyệt",
  //   html: emailContent
  // });

  return true;
}

export async function sendPartnerApprovalEmailExisting(data: PartnerApprovalExistingEmailData) {
  const emailContent = `
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
      <p>Xin chào <strong>${data.name}</strong>,</p>
      
      <p>Đơn đăng ký đối tác cho khách sạn <strong>"${data.hotelName}"</strong> đã được duyệt thành công.</p>
      
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

  // Log ra console (development)
  console.log("\n📧 ===== EMAIL THÔNG BÁO DUYỆT (TÀI KHOẢN CŨ) =====");
  console.log(`To: ${data.email}`);
  console.log(`Subject: Đơn đăng ký Partner đã được duyệt`);
  console.log(`Hotel: ${data.hotelName}`);
  console.log("=====================================\n");

  // TODO: Gửi email thật
  // await sendEmail({
  //   to: data.email,
  //   subject: "Đơn đăng ký Partner đã được duyệt",
  //   html: emailContent
  // });

  return true;
}
