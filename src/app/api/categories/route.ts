import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
      children: {
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: true } } },
      },
    },
    where: { parentId: null }, // only top-level
  });
  return NextResponse.json(categories);
}

// flat list for selects (admin)
export async function HEAD() {
  const all = await prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, image, parentId, order } = body;

  if (!name) return NextResponse.json({ error: "שם חובה" }, { status: 400 });

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w֐-׿-]/g, "")
    + "-" + Date.now();

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      description: description || null,
      image: image || null,
      parentId: parentId || null,
      order: order ?? 0,
      isActive: true,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
