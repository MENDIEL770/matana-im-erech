import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("GET /api/coupons error:", error);
    return NextResponse.json({ error: "שגיאה בטעינת קופונים" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      type,
      value,
      minOrderAmount,
      expiresAt,
      maxUses,
      maxUsesPerUser,
      agentId,
      holiday,
      isActive,
    } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "קוד, סוג וערך הם שדות חובה" }, { status: 400 });
    }
    if (value <= 0) {
      return NextResponse.json({ error: "ערך הקופון חייב להיות גדול מאפס" }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "קוד קופון זה כבר קיים" }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minOrderAmount: minOrderAmount ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ?? null,
        maxUsesPerUser: maxUsesPerUser ?? null,
        agentId: agentId ?? null,
        holiday: holiday ?? null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("POST /api/coupons error:", error);
    return NextResponse.json({ error: "שגיאה ביצירת קופון" }, { status: 500 });
  }
}
