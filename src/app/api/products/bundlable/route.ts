import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const products = await prisma.product.findMany({
    where: {
      isBundlable: true,
      isActive: true,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    select: {
      id: true,
      name: true,
      regularPrice: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
    take: 20,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}
