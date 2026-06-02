import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      customer: true,
      activities: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Serialize Decimals
  const serialized = {
    ...lead,
    expectedValue: lead.expectedValue ? lead.expectedValue.toString() : null,
  };

  return NextResponse.json(serialized);
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const body = await req.json();
  const { status, assignedTo, notes, expectedValue } = body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (assignedTo !== undefined) data.assignedTo = assignedTo;
  if (notes !== undefined) data.notes = notes;
  if (expectedValue !== undefined) data.expectedValue = expectedValue ? Number(expectedValue) : null;

  const lead = await prisma.lead.update({ where: { id }, data });

  return NextResponse.json({
    ...lead,
    expectedValue: lead.expectedValue ? lead.expectedValue.toString() : null,
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
