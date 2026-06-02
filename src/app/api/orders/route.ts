import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const take = parseInt(searchParams.get("take") ?? "100");

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" } },
              { customer: { shaliachName: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      agent: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerId,
    items,
    discount = 0,
    discountType = "FIXED",
    notes,
    internalNote,
    agentId,
    shippingType = "CONSOLIDATED",
    shippingCost = 0,
  } = body;

  if (!customerId || !items?.length) {
    return NextResponse.json({ error: "חסר מזהה לקוח או פריטים" }, { status: 400 });
  }

  // Calculate financials
  const subtotal: number = items.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + item.quantity * item.unitPrice,
    0
  );

  const discountAmount =
    discountType === "PERCENT" ? (subtotal * Number(discount)) / 100 : Number(discount);

  const total = subtotal - discountAmount + Number(shippingCost);

  const totalCost: number = items.reduce(
    (sum: number, item: { quantity: number; unitCost?: number }) =>
      sum + item.quantity * (item.unitCost ?? 0),
    0
  );

  const profit = total - totalCost;

  // Calculate agent commission if agent assigned
  let agentCommission = 0;
  if (agentId) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { commissionRate: true },
    });
    if (agent) {
      agentCommission = profit * (Number(agent.commissionRate) / 100);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = await (prisma.order.create as any)({
    data: {
      orderNumber: generateOrderNumber(),
      customerId,
      discount,
      discountType,
      subtotal,
      shippingCost,
      total,
      totalCost,
      profit,
      agentId: agentId || null,
      agentCommission,
      notes,
      internalNote,
      shippingType: shippingType as never,
      items: {
        create: items.map(
          (item: {
            productId?: string;
            name: string;
            quantity: number;
            unitPrice: number;
            unitCost?: number;
          }) => ({
            productId: item.productId || null,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitCost: item.unitCost ?? 0,
            total: item.quantity * item.unitPrice,
          })
        ),
      },
    },
    include: { customer: true, items: true },
  });

  return NextResponse.json(order, { status: 201 });
}
