import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { url, isPrimary, isHover, order, altText } = body;

  // If setting as primary, clear existing primary
  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId: id, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  // If setting as hover, clear existing hover
  if (isHover) {
    await prisma.productImage.updateMany({
      where: { productId: id, isHover: true },
      data: { isHover: false },
    });
  }

  const image = await prisma.productImage.create({
    data: {
      productId: id,
      url,
      isPrimary: isPrimary ?? false,
      isHover: isHover ?? false,
      order: order ?? 0,
      altText: altText ?? null,
    },
  });

  return NextResponse.json(image);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params; // consume
  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get("imageId");

  if (!imageId) {
    return NextResponse.json({ error: "imageId required" }, { status: 400 });
  }

  await prisma.productImage.delete({ where: { id: imageId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { imageId, isPrimary, isHover } = body;

  if (!imageId) {
    return NextResponse.json({ error: "imageId required" }, { status: 400 });
  }

  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId: id, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  if (isHover) {
    await prisma.productImage.updateMany({
      where: { productId: id, isHover: true },
      data: { isHover: false },
    });
  }

  const image = await prisma.productImage.update({
    where: { id: imageId },
    data: {
      ...(isPrimary !== undefined ? { isPrimary } : {}),
      ...(isHover !== undefined ? { isHover } : {}),
    },
  });

  return NextResponse.json(image);
}
