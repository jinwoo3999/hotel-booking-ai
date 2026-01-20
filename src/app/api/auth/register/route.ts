import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    // 1. Kiểm tra dữ liệu
    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đủ email và mật khẩu" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra email trùng lặp
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng" },
        { status: 409 }
      );
    }

    // 3. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Tạo User mới
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: "USER",
      },
    });

    // 5. Trả về thành công
    return NextResponse.json(
      { message: "Đăng ký thành công", user: newUser },
      { status: 201 }
    );

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống", error: error },
      { status: 500 }
    );
  }
}