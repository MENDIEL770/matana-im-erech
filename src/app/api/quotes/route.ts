import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuoteNumber } from "@/lib/utils";

function getPriceTier(product: {
  regularPrice: unknown;
  price20?: unknown;
  price50?: unknown;
  price100?: unknown;
  price250?: unknown;
  price500?: unknown;
}, qty: number): number {
  const n = (v: unknown) => (v != null ? Number(v) : null);
  if (qty >= 500 && n(product.price500)) return n(product.price500)!;
  if (qty >= 250 && n(product.price250)) return n(product.price250)!;
  if (qty >= 100 && n(product.price100)) return n(product.price100)!;
  if (qty >= 50 && n(product.price50)) return n(product.price50)!;
  if (qty >= 20 && n(product.price20)) return n(product.price20)!;
  return n(product.regularPrice) ?? 0;
}

export async function GET() {
  const quotes = await prisma.quote.findMany({
    include: {
      customer: { select: { id: true, shaliachName: true, chabadHouseName: true, email: true } },
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(JSON.parse(JSON.stringify(quotes)));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerId,
    validUntil,
    notes,
    internalNote,
    discount = 0,
    discountType = "FIXED",
    items = [],
  } = body;

  if (!customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }
  if (!items.length) {
    return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
  }

  // Resolve price tiers for items with productId
  const resolvedItems: Array<{
    productId?: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    customizations?: unknown;
    total: number;
  }> = [];

  for (const item of items) {
    let unitPrice = Number(item.unitPrice ?? 0);
    let unitCost = Number(item.unitCost ?? 0);

    if (item.productId) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        unitPrice = item.unitPrice != null ? Number(item.unitPrice) : getPriceTier(product, item.quantity);
        unitCost = item.unitCost != null ? Number(item.unitCost) : Number(product.costPrice);
      }
    }

    resolvedItems.push({
      productId: item.productId,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice,
      unitCost,
      customizations: item.customizations,
      total: unitPrice * item.quantity,
    });
  }

  const subtotal = resolvedItems.reduce((s, i) => s + i.total, 0);
  const discountAmount =
    discountType === "PERCENT" ? (subtotal * Number(discount)) / 100 : Number(discount);
  const total = Math.max(0, subtotal - discountAmount);
  const totalCost = resolvedItems.reduce((s, i) => s + i.unitCost * i.quantity, 0);
  const profit = total - totalCost;

  const quoteNumber = generateQuoteNumber();

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      customerId,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes,
      internalNote,
      discount: Number(discount),
      discountType,
      subtotal,
      total,
      totalCost,
      profit,
      items: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: resolvedItems as any,
      },
    },
    include: {
      customer: true,
      items: true,
    },
  });

  return NextResponse.json(JSON.parse(JSON.stringify(quote)), { status: 201 });
}
