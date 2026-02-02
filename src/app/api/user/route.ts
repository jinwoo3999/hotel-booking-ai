import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcrypt";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // 1. Lấy thông tin User từ DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "Tài khoản Google không cần đổi mật khẩu." }, { status: 400 });
    }

    // 2. So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Mật khẩu hiện tại không đúng" }, { status: 400 });
    }

    // 3. Mã hóa mật khẩu mới và lưu lại
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Đổi mật khẩu thành công" });

  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}