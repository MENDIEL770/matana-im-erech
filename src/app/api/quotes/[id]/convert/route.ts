import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  if (quote.status === "CONVERTED") {
    return NextResponse.json({ error: "Quote already converted" }, { status: 400 });
  }

  if ((quote as any).order) {
    return NextResponse.json({ error: "Quote already has an order" }, { status: 400 });
  }

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: quote.customerId,
      quoteId: quote.id,
      discount: quote.discount,
      subtotal: quote.subtotal,
      total: quote.total,
      totalCost: quote.totalCost,
      profit: quote.profit,
      notes: quote.notes,
      internalNote: quote.internalNote,
      items: {
        create: quote.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitCost: item.unitCost,
          customizations: item.customizations ?? undefined,
          total: item.total,
        })),
      },
    },
  });

  await prisma.quote.update({
    where: { id },
    data: { status: "CONVERTED" },
  });

  return NextResponse.json(JSON.parse(JSON.stringify({ order, quoteId: id })), { status: 201 });
}
