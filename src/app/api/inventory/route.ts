import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const low = searchParams.get("low") === "true";

    const all = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        minStock: true,
        warehouseLocation: true,
      },
      orderBy: { stock: "asc" },
    });

    const products = low ? all.filter((p) => p.stock <= p.minStock) : all;

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json({ error: "שגיאה בטעינת מלאי" }, { status: 500 });
  }
}
