import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập email và mật khẩu" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Email này chưa được đăng ký" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Mật khẩu không đúng" },
        { status: 401 }
      );
    }

    const { ...userWithoutPass } = user;

    return NextResponse.json(
      { 
        message: "Đăng nhập thành công", 
        user: userWithoutPass 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}