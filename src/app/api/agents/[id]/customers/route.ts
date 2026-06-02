import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agentCustomers = await prisma.agentCustomer.findMany({
    where: { agentId: id },
    include: {
      customer: {
        select: {
          id: true,
          shaliachName: true,
          chabadHouseName: true,
          phone: true,
          email: true,
          tier: true,
          totalSpent: true,
          _count: { select: { orders: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return NextResponse.json(
    agentCustomers.map((ac) => ({
      ...ac.customer,
      totalSpent: Number(ac.customer.totalSpent),
      assignedAt: ac.assignedAt,
    }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { customerId } = await req.json();

  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  // Check not already assigned
  const existing = await prisma.agentCustomer.findUnique({
    where: { agentId_customerId: { agentId: id, customerId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already assigned" }, { status: 409 });
  }

  const ac = await prisma.agentCustomer.create({
    data: { agentId: id, customerId },
    include: { customer: true },
  });

  return NextResponse.json(ac, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  await prisma.agentCustomer.delete({
    where: { agentId_customerId: { agentId: id, customerId } },
  });

  return NextResponse.json({ success: true });
}
