import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — פריטי המארז הנוכחי
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const items = await prisma.bundleItem.findMany({
    where: { bundleId: id },
    include: {
      product: {
        select: { id: true, name: true, regularPrice: true, images: { where: { isPrimary: true }, take: 1 } },
      },
    },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(items);
}

// POST — הוסף מוצר למארז
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bundleId } = await params;
  const { productId, quantity = 1 } = await req.json();

  if (!productId) return NextResponse.json({ error: "חסר productId" }, { status: 400 });

  // בדוק שלא כבר קיים
  const existing = await prisma.bundleItem.findFirst({ where: { bundleId, productId } });
  if (existing) return NextResponse.json({ error: "המוצר כבר במארז" }, { status: 409 });

  const count = await prisma.bundleItem.count({ where: { bundleId } });
  const item = await prisma.bundleItem.create({
    data: { bundleId, productId, quantity, order: count },
    include: {
      product: {
        select: { id: true, name: true, regularPrice: true, images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  });
  return NextResponse.json(item, { status: 201 });
}

// PATCH — עדכן כמות
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bundleId } = await params;
  const { itemId, quantity } = await req.json();
  const item = await prisma.bundleItem.updateMany({
    where: { id: itemId, bundleId },
    data: { quantity },
  });
  return NextResponse.json(item);
}

// DELETE — הסר מוצר מהמארז
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bundleId } = await params;
  const { itemId } = await req.json();
  await prisma.bundleItem.deleteMany({ where: { id: itemId, bundleId } });
  return NextResponse.json({ success: true });
}
