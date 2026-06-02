import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, costs: { orderBy: { order: "asc" } }, fields: { orderBy: { order: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { costs, fields, ...data } = body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(costs !== undefined ? {
        costs: {
          deleteMany: {},
          create: costs.map((c: any, i: number) => ({ ...c, order: i })),
        },
      } : {}),
      ...(fields !== undefined ? {
        fields: {
          deleteMany: {},
          create: fields.map((f: any, i: number) => ({ ...f, order: i })),
        },
      } : {}),
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
