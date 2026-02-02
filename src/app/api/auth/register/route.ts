import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Thiếu thông tin bắt buộc!" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra xem email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng!" },
        { status: 409 }
      );
    }

    // 3. Mã hóa mật khẩu (Bắt buộc)
    const hashedPassword = await hash(password, 10);

    // 4. Tạo user mới trong Database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        points: 0,
      },
    });

    // 5. Trả về thành công 
    const { password: newUserPassword, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      { user: userWithoutPassword, message: "Đăng ký thành công!" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}