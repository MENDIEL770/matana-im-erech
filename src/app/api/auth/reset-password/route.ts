import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { identifier, token, newPassword } = await req.json();

  if (!identifier || !token || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "פרטים חסרים או סיסמה קצרה מדי" }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findFirst({
    where: { identifier, token },
  });

  if (!record) {
    return NextResponse.json({ error: "קוד שגוי" }, { status: 400 });
  }

  if (record.expires < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return NextResponse.json({ error: "הקוד פג תוקף — בקש קוד חדש" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { email: identifier }, data: { password: hashed } });
  await prisma.passwordResetToken.delete({ where: { id: record.id } });

  return NextResponse.json({ success: true });
}
