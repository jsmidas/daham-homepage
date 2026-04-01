import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db";

export async function POST(request: Request) {
  const { username, email, password, name, phone } = await request.json();

  if (!username || !email || !password || !name) {
    return NextResponse.json(
      { error: "아이디, 이메일, 비밀번호, 이름은 필수입니다." },
      { status: 400 }
    );
  }

  // 아이디 중복 체크
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return NextResponse.json(
      { error: "이미 사용 중인 아이디입니다." },
      { status: 409 }
    );
  }

  // 이메일 중복 체크
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json(
      { error: "이미 가입된 이메일입니다." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      name,
      phone: phone ?? null,
      provider: "email",
      role: "CUSTOMER",
    },
  });

  return NextResponse.json(
    { message: "회원가입 완료", userId: user.id },
    { status: 201 }
  );
}
