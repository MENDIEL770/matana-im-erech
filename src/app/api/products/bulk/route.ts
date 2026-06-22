import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids, action, payload } = await req.json();
  if (!ids?.length || !action)
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });

  switch (action) {
    case "delete":
      await prisma.inventoryLog.deleteMany({ where: { productId: { in: ids } } });
      await prisma.bundleItem.deleteMany({ where: { OR: [{ bundleId: { in: ids } }, { productId: { in: ids } }] } });
      await prisma.productImage.deleteMany({ where: { productId: { in: ids } } });
      await prisma.productCost.deleteMany({ where: { productId: { in: ids } } });
      await prisma.productField.deleteMany({ where: { productId: { in: ids } } });
      await prisma.product.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ deleted: ids.length });

    case "setTag":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { tag: payload.tag ?? null } });
      return NextResponse.json({ updated: ids.length });

    case "setCategory":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { categoryId: payload.categoryId } });
      return NextResponse.json({ updated: ids.length });

    case "setActive":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: payload.isActive } });
      return NextResponse.json({ updated: ids.length });

    case "setOrderMode":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { orderMode: payload.orderMode } });
      return NextResponse.json({ updated: ids.length });

    default:
      return NextResponse.json({ error: "פעולה לא מוכרת" }, { status: 400 });
  }
}
