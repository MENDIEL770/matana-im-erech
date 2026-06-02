import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const agents = await prisma.agent.findMany({
    include: {
      _count: { select: { orders: true, agentCustomers: true } },
      orders: {
        select: {
          total: true,
          profit: true,
          agentCommission: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = agents.map((agent) => {
    const monthOrders = agent.orders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth
    );
    const totalRevenue = agent.orders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );
    const monthCommission = monthOrders.reduce(
      (sum, o) => sum + Number(o.agentCommission),
      0
    );
    const totalCommission = agent.orders.reduce(
      (sum, o) => sum + Number(o.agentCommission),
      0
    );

    return {
      id: agent.id,
      name: agent.name,
      phone: agent.phone,
      email: agent.email,
      commissionRate: Number(agent.commissionRate),
      isActive: agent.isActive,
      createdAt: agent.createdAt,
      totalOrders: agent._count.orders,
      totalCustomers: agent._count.agentCustomers,
      totalRevenue,
      totalCommission,
      monthCommission,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, commissionRate, userId } = body;

  if (!name || !phone || !email || commissionRate === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const agent = await prisma.agent.create({
    data: {
      name,
      phone,
      email,
      commissionRate,
      userId: userId ?? null,
    },
  });

  return NextResponse.json(agent, { status: 201 });
}
