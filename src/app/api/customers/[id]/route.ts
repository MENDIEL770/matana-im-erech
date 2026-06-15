import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin can get any customer; customer can only get their own
  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role !== "ADMIN" && customer.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Serialize Decimals
  return NextResponse.json({
    ...customer,
    totalSpent: Number(customer.totalSpent),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role !== "ADMIN" && existing.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Allowed fields for self-update
  const allowedFields = [
    "chabadHouseName",
    "shaliachName",
    "phone",
    "address",
    "city",
    "country",
    "website",
  ] as const;

  // Admins can also update tier, notes, businessNumber, etc.
  const adminFields = ["tier", "notes", "businessNumber", "isActive", "marketingConsent", "directDebitInterest"] as const;

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) data[field] = body[field];
  }
  if (session.role === "ADMIN") {
    for (const field of adminFields) {
      if (field in body) data[field] = body[field];
    }
  }

  const updated = await prisma.customer.update({ where: { id }, data });

  return NextResponse.json({ ...updated, totalSpent: Number(updated.totalSpent) });
}
