import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findFirst({
    where: { userId: session.id },
    select: {
      id: true,
      chabadHouseName: true,
      shaliachName: true,
      phone: true,
      email: true,
      country: true,
      website: true,
      address: true,
      city: true,
    },
  });

  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(customer);
}
