import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chabadHouse, contactName, phone, email, notes, source } = body;

  if (!chabadHouse || !contactName || !phone) {
    return NextResponse.json(
      { error: "chabadHouse, contactName, phone are required" },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      chabadHouse,
      contactName,
      phone,
      email: email || null,
      source: source || "website",
      notes: notes || null,
      status: "NEW",
    },
  });

  return NextResponse.json(lead, { status: 201 });
}

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });
  return NextResponse.json(leads);
}
