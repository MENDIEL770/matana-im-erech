import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { trackingNumber, status, estimatedDate, provider } = body;

  // Upsert: find existing shipment for this order or create a new one
  const existing = await prisma.shipment.findFirst({
    where: { orderId: id },
    orderBy: { createdAt: "desc" },
  });

  let shipment;
  if (existing) {
    shipment = await prisma.shipment.update({
      where: { id: existing.id },
      data: {
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        ...(status ? { status } : {}),
        ...(estimatedDate ? { estimatedDate: new Date(estimatedDate) } : {}),
        ...(provider ? { provider } : {}),
      },
    });
  } else {
    shipment = await prisma.shipment.create({
      data: {
        orderId: id,
        trackingNumber: trackingNumber ?? null,
        status: status ?? "PENDING",
        estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
        provider: provider ?? null,
      },
    });
  }

  return NextResponse.json(shipment);
}
