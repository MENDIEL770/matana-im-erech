import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { code, subtotal } = await req.json();
  if (!code) return NextResponse.json({ error: "קוד קופון חסר" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
    include: { agent: { select: { id: true, name: true } } },
  });

  if (!coupon || !coupon.isActive)
    return NextResponse.json({ error: "קוד קופון לא תקף" }, { status: 404 });

  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return NextResponse.json({ error: "קוד הקופון פג תוקף" }, { status: 400 });

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    return NextResponse.json({ error: "קוד הקופון מוצה" }, { status: 400 });

  const sub = Number(subtotal ?? 0);
  if (coupon.minOrderAmount && sub < Number(coupon.minOrderAmount))
    return NextResponse.json({
      error: `מינימום הזמנה ₪${Number(coupon.minOrderAmount).toFixed(0)} לשימוש בקופון`,
    }, { status: 400 });

  // Calculate customer discount
  let discountAmount = 0;
  if (coupon.type === "PERCENT") {
    discountAmount = sub * (Number(coupon.value) / 100);
  } else {
    discountAmount = Math.min(Number(coupon.value), sub);
  }

  // Calculate agent commission (on original subtotal)
  let agentCommission = 0;
  if (coupon.agentId) {
    if (coupon.agentCommissionType === "PERCENT") {
      agentCommission = sub * (Number(coupon.agentCommissionValue) / 100);
    } else {
      agentCommission = Number(coupon.agentCommissionValue);
    }
  }

  return NextResponse.json({
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: Number(coupon.value),
    discountAmount: Math.round(discountAmount * 100) / 100,
    agent: coupon.agent,
    agentCommissionType: coupon.agentCommissionType,
    agentCommissionValue: Number(coupon.agentCommissionValue),
    agentCommission: Math.round(agentCommission * 100) / 100,
  });
}
