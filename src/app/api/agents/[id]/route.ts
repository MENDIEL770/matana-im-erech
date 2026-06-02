import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      agentCustomers: {
        include: {
          customer: {
            select: {
              id: true,
              shaliachName: true,
              chabadHouseName: true,
              phone: true,
              email: true,
              tier: true,
              _count: { select: { orders: true } },
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      },
      orders: {
        include: {
          customer: {
            select: { shaliachName: true, chabadHouseName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const allOrders = await prisma.order.findMany({
    where: { agentId: id },
    select: { total: true, profit: true, agentCommission: true, createdAt: true },
  });

  const monthOrders = allOrders.filter(
    (o) => new Date(o.createdAt) >= startOfMonth
  );

  const summary = {
    totalOrders: allOrders.length,
    totalRevenue: allOrders.reduce((s, o) => s + Number(o.total), 0),
    totalCommission: allOrders.reduce((s, o) => s + Number(o.agentCommission), 0),
    monthOrders: monthOrders.length,
    monthRevenue: monthOrders.reduce((s, o) => s + Number(o.total), 0),
    monthCommission: monthOrders.reduce((s, o) => s + Number(o.agentCommission), 0),
  };

  return NextResponse.json({
    ...agent,
    commissionRate: Number(agent.commissionRate),
    orders: agent.orders.map((o) => ({
      ...o,
      total: Number(o.total),
      profit: Number(o.profit),
      agentCommission: Number(o.agentCommission),
    })),
    summary,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, phone, email, commissionRate, isActive } = body;

  const agent = await prisma.agent.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(commissionRate !== undefined && { commissionRate }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ ...agent, commissionRate: Number(agent.commissionRate) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.agent.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
