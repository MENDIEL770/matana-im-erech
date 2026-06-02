import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
      order: { select: { id: true, orderNumber: true, status: true } },
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(JSON.parse(JSON.stringify(quote)));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.quote.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { status, notes, internalNote, discount, discountType, validUntil, items } = body;

  // If items are being updated, recalculate totals
  let subtotal = Number(existing.subtotal);
  let totalCost = Number(existing.totalCost);

  const updateData: Record<string, unknown> = {};

  if (status !== undefined) {
    updateData.status = status;
    if (status === "SENT") updateData.sentAt = new Date();
    if (status === "APPROVED") updateData.approvedAt = new Date();
  }
  if (notes !== undefined) updateData.notes = notes;
  if (internalNote !== undefined) updateData.internalNote = internalNote;
  if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;

  if (items !== undefined) {
    // Delete existing items and recreate
    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.quoteItem.createMany as any)({
      data: resolvedItems.map((i) => ({ ...i, quoteId: id })),
    });

    subtotal = resolvedItems.reduce((s, i) => s + i.total, 0);
    totalCost = resolvedItems.reduce((s, i) => s + i.unitCost * i.quantity, 0);
    updateData.subtotal = subtotal;
    updateData.totalCost = totalCost;
  }

  const effectiveDiscount = discount !== undefined ? Number(discount) : Number(existing.discount);
  const effectiveDiscountType = discountType ?? existing.discountType;

  if (discount !== undefined || discountType !== undefined || items !== undefined) {
    const discountAmount =
      effectiveDiscountType === "PERCENT"
        ? (subtotal * effectiveDiscount) / 100
        : effectiveDiscount;
    const total = Math.max(0, subtotal - discountAmount);
    const profit = total - totalCost;
    updateData.discount = effectiveDiscount;
    updateData.discountType = effectiveDiscountType;
    updateData.total = total;
    updateData.profit = profit;
  }

  const updated = await prisma.quote.update({
    where: { id },
    data: updateData,
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json(JSON.parse(JSON.stringify(updated)));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({ where: { id } });
  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (quote.status === "CONVERTED") {
    return NextResponse.json({ error: "Cannot delete a converted quote" }, { status: 400 });
  }

  await prisma.quote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
