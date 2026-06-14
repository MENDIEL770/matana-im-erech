import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, description, image, parentId, order, isActive } = body;

  const slug = name
    ? name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w֐-׿-]/g, "") + "-" + Date.now()
    : undefined;

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim(), slug } : {}),
      ...(description !== undefined ? { description: description || null } : {}),
      ...(image !== undefined ? { image: image || null } : {}),
      ...(parentId !== undefined ? { parentId: parentId || null } : {}),
      ...(order !== undefined ? { order } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `לא ניתן למחוק — יש ${count} מוצרים בקטגוריה זו` },
      { status: 400 }
    );
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
