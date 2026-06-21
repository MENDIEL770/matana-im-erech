import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ImportProduct {
  name: string;
  shortDescription?: string;
  description?: string;
  categoryName?: string;
  mainCategoryName?: string;
  regularPrice?: number;
  price20?: number;
  price50?: number;
  price100?: number;
  price250?: number;
  price500?: number;
  tag?: "NEW" | "RECOMMENDED" | "POPULAR" | "PREMIUM";
  isCustomizable?: boolean;
  isFeatured?: boolean;
}

function slugify(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase() + "-" + Date.now();
}

async function findOrCreateCategory(mainName?: string, subName?: string): Promise<string | null> {
  if (!subName && !mainName) return null;

  if (!subName && mainName) {
    const existing = await prisma.category.findFirst({
      where: { name: { contains: mainName, mode: "insensitive" }, parentId: null },
    });
    if (existing) return existing.id;
    const created = await prisma.category.create({
      data: { name: mainName, slug: slugify(mainName), isActive: true },
    });
    return created.id;
  }

  // Find or create main category
  let parentId: string | null = null;
  if (mainName) {
    const main = await prisma.category.findFirst({
      where: { name: { contains: mainName, mode: "insensitive" }, parentId: null },
    });
    if (main) {
      parentId = main.id;
    } else {
      const created = await prisma.category.create({
        data: { name: mainName, slug: slugify(mainName), isActive: true },
      });
      parentId = created.id;
    }
  }

  // Find or create sub-category
  const sub = await prisma.category.findFirst({
    where: { name: { contains: subName!, mode: "insensitive" }, parentId },
  });
  if (sub) return sub.id;

  const created = await prisma.category.create({
    data: { name: subName!, slug: slugify(subName!), parentId, isActive: true },
  });
  return created.id;
}

export async function POST(req: NextRequest) {
  const { products }: { products: ImportProduct[] } = await req.json();

  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "רשימת מוצרים ריקה" }, { status: 400 });
  }

  const results: { name: string; status: "created" | "error"; error?: string }[] = [];

  for (const p of products) {
    try {
      const categoryId = await findOrCreateCategory(p.mainCategoryName, p.categoryName);
      const sku = `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      await prisma.product.create({
        data: {
          name: p.name,
          sku,
          shortDescription: p.shortDescription,
          description: p.description,
          categoryId,
          regularPrice: p.regularPrice ?? 0,
          price20: p.price20,
          price50: p.price50,
          price100: p.price100,
          price250: p.price250,
          price500: p.price500,
          tag: p.tag ?? null,
          isCustomizable: p.isCustomizable ?? false,
          isFeatured: p.isFeatured ?? false,
          isActive: true,
        },
      });

      results.push({ name: p.name, status: "created" });
    } catch (e) {
      results.push({ name: p.name, status: "error", error: String(e) });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const errors = results.filter((r) => r.status === "error").length;

  return NextResponse.json({ created, errors, results });
}
