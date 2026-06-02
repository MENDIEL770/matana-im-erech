import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { smsProvider } from "@/lib/sms/yemot";
import { SMS_TEMPLATES } from "@/lib/sms/provider";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true, shipments: true, payments: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status, ...rest } = body;

  // Recalculate agent commission when status changes to COMPLETED
  let extraData: Record<string, unknown> = {};
  if (status === "COMPLETED") {
    const existing = await prisma.order.findUnique({
      where: { id },
      select: { agentId: true, profit: true },
    });
    if (existing?.agentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: existing.agentId },
        select: { commissionRate: true },
      });
      if (agent) {
        const commission =
          Number(existing.profit) * (Number(agent.commissionRate) / 100);
        extraData = { agentCommission: commission };
      }
    }
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status, ...rest, ...extraData },
    include: { customer: true, shipments: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  // ── שלח SMS לפי שינוי סטטוס ──────────────────────────
  if (status && order.customer?.phone) {
    const phone      = order.customer.phone;
    const name       = order.customer.shaliachName;
    const orderNum   = order.orderNumber;
    const tracking   = order.shipments?.[0]?.trackingNumber ?? "";

    const msgMap: Partial<Record<string, string>> = {
      NEW:             SMS_TEMPLATES.ORDER_RECEIVED(name, orderNum),
      IN_PRODUCTION:   SMS_TEMPLATES.IN_PRODUCTION(orderNum),
      READY:           SMS_TEMPLATES.READY(orderNum),
      SHIPPED:         SMS_TEMPLATES.SHIPPED(orderNum, tracking),
      OUT_FOR_DELIVERY: SMS_TEMPLATES.OUT_FOR_DELIVERY(),
      DELIVERED:       SMS_TEMPLATES.DELIVERED(),
    };

    const msg = msgMap[status];
    if (msg) {
      // Fire and forget — don't block the response
      smsProvider.send(phone, msg).catch(console.error);
    }
  }

  return NextResponse.json(order);
}
