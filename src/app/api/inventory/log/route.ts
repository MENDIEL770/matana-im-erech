import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { productId, type, quantity, reason, reference } = await req.json();

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json({ error: "נתונים חסרים" }, { status: 400 });
    }

    if (!["IN", "OUT", "ADJUSTMENT"].includes(type)) {
      return NextResponse.json({ error: "סוג תנועה לא חוקי" }, { status: 400 });
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: "כמות חייבת להיות חיובית" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "מוצר לא נמצא" }, { status: 404 });

    let newStock: number;
    if (type === "IN") {
      newStock = product.stock + quantity;
    } else if (type === "OUT") {
      newStock = Math.max(0, product.stock - quantity);
    } else {
      // ADJUSTMENT: quantity is the absolute new stock level
      newStock = quantity;
    }

    const [log] = await prisma.$transaction([
      prisma.inventoryLog.create({
        data: { productId, type, quantity, reason: reason ?? null, reference: reference ?? null },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
    ]);

    return NextResponse.json({ log, newStock }, { status: 201 });
  } catch (error) {
    console.error("POST /api/inventory/log error:", error);
    return NextResponse.json({ error: "שגיאה ברישום תנועת מלאי" }, { status: 500 });
  }
}
