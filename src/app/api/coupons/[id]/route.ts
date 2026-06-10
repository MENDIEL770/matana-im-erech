import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return NextResponse.json({ error: "קופון לא נמצא" }, { status: 404 });
  return NextResponse.json(coupon);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();

    if (body.code) {
      const conflict = await prisma.coupon.findFirst({
        where: { code: body.code.toUpperCase(), NOT: { id } },
      });
      if (conflict) {
        return NextResponse.json({ error: "קוד קופון זה כבר קיים" }, { status: 409 });
      }
      body.code = body.code.toUpperCase();
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...body,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
    });
    return NextResponse.json(coupon);
  } catch {
    return NextResponse.json({ error: "שגיאה בעדכון קופון" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
