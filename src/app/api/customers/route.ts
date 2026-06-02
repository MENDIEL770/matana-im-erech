import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    select: {
      id: true,
      shaliachName: true,
      chabadHouseName: true,
      email: true,
      phone: true,
      city: true,
      tier: true,
    },
    orderBy: { shaliachName: "asc" },
  });

  return NextResponse.json(customers);
}
