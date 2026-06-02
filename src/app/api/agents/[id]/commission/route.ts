import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const from = fromParam ? new Date(fromParam) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = toParam ? new Date(toParam + "T23:59:59") : new Date();

  const orders = await prisma.order.findMany({
    where: {
      agentId: id,
      createdAt: { gte: from, lte: to },
    },
    include: {
      customer: {
        select: { shaliachName: true, chabadHouseName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const commissionRate = Number(agent.commissionRate);

  const ordersWithCommission = orders.map((o) => {
    const profit = Number(o.profit);
    const commission = profit * (commissionRate / 100);
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer,
      createdAt: o.createdAt,
      total: Number(o.total),
      profit,
      commission,
      status: o.status,
    };
  });

  const totalRevenue = ordersWithCommission.reduce((s, o) => s + o.total, 0);
  const totalProfit = ordersWithCommission.reduce((s, o) => s + o.profit, 0);
  const totalCommission = ordersWithCommission.reduce((s, o) => s + o.commission, 0);

  return NextResponse.json({
    agent: {
      id: agent.id,
      name: agent.name,
      commissionRate,
    },
    period: { from, to },
    orders: ordersWithCommission,
    totalRevenue,
    totalProfit,
    totalCommission,
    commissionRate,
  });
}
