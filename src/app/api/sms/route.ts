import { NextRequest, NextResponse } from "next/server";
import { smsProvider } from "@/lib/sms/yemot";
import { prisma } from "@/lib/prisma";

// POST /api/sms — שליחת SMS ידנית
export async function POST(req: NextRequest) {
  const { phone, message } = await req.json();

  if (!phone || !message) {
    return NextResponse.json({ error: "phone and message required" }, { status: 400 });
  }

  const result = await smsProvider.send(phone, message);
  return NextResponse.json(result);
}

// GET /api/sms — לוג SMS אחרון
export async function GET() {
  const logs = await prisma.smsLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 100,
  });
  return NextResponse.json(logs);
}
