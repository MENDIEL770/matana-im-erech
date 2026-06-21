import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({
    include: { agent: { select: { id: true, name: true } }, _count: { select: { usages: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { code, description, type, value, minOrderAmount, expiresAt, maxUses, isActive,
    agentId, agentCommissionType, agentCommissionValue } = body;

  if (!code || value == null) return NextResponse.json({ error: "קוד וערך חובה" }, { status: 400 });

  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) return NextResponse.json({ error: "קוד קופון כבר קיים" }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase().trim(),
      description: description || null,
      type: type ?? "PERCENT",
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      isActive: isActive ?? true,
      agentId: agentId || null,
      agentCommissionType: agentCommissionType ?? "PERCENT",
      agentCommissionValue: Number(agentCommissionValue ?? 0),
    },
    include: { agent: { select: { id: true, name: true } } },
  });
  return NextResponse.json(coupon);
}
