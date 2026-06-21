import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(body.code !== undefined && { code: body.code.toUpperCase().trim() }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.value !== undefined && { value: Number(body.value) }),
      ...(body.minOrderAmount !== undefined && { minOrderAmount: body.minOrderAmount ? Number(body.minOrderAmount) : null }),
      ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
      ...(body.maxUses !== undefined && { maxUses: body.maxUses ? Number(body.maxUses) : null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.agentId !== undefined && { agentId: body.agentId || null }),
      ...(body.agentCommissionType !== undefined && { agentCommissionType: body.agentCommissionType }),
      ...(body.agentCommissionValue !== undefined && { agentCommissionValue: Number(body.agentCommissionValue) }),
    },
    include: { agent: { select: { id: true, name: true } } },
  });
  return NextResponse.json(coupon);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.couponUsage.deleteMany({ where: { couponId: id } });
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
