import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  categoryId: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  productType: z.enum(["MANUFACTURED", "PURCHASED", "IMPORTED", "SPECIAL_ORDER"]).default("MANUFACTURED"),
  costPrice: z.coerce.number().default(0),
  regularPrice: z.coerce.number().default(0),
  price20: z.coerce.number().optional(),
  price50: z.coerce.number().optional(),
  price100: z.coerce.number().optional(),
  price250: z.coerce.number().optional(),
  price500: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  minQuantity: z.coerce.number().default(1),
  hasEmbroidery: z.coerce.boolean().default(false),
  embroideryPrice: z.coerce.number().optional(),
  hasEngraving: z.coerce.boolean().default(false),
  engravingPrice: z.coerce.number().optional(),
  hasLogoprint: z.coerce.boolean().default(false),
  logoprintPrice: z.coerce.number().optional(),
  hasEmbossing: z.coerce.boolean().default(false),
  embossingPrice: z.coerce.number().optional(),
  hasPersonal: z.coerce.boolean().default(false),
  stock: z.coerce.number().default(0),
  minStock: z.coerce.number().default(5),
  warehouseLocation: z.string().optional(),
  supplierName: z.string().optional(),
  supplierPhone: z.string().optional(),
  supplierEmail: z.string().optional(),
  leadTimeDays: z.coerce.number().optional(),
  originCountry: z.string().optional(),
  tag: z.enum(["NEW", "RECOMMENDED", "POPULAR", "PREMIUM"]).optional().nullable(),
  isFeatured: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  costs: z.array(z.object({
    label: z.string(),
    amount: z.coerce.number(),
    isPercent: z.boolean().default(false),
    order: z.number().default(0),
  })).optional(),
  fields: z.array(z.object({
    fieldKey: z.string(),
    label: z.string(),
    fieldType: z.enum(["TEXT", "PHONE", "EMAIL", "ADDRESS", "TEXTAREA", "FILE"]).default("TEXT"),
    isRequired: z.boolean().default(false),
    isForExcel: z.boolean().default(true),
    order: z.number().default(0),
  })).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const holiday = searchParams.get("holiday");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(featured === "true" ? { isFeatured: true } : {}),
      ...(holiday ? { holidays: { has: holiday } } : {}),
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { costs, fields, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      tag: data.tag ?? null,
      costs: costs ? { create: costs.map((c, i) => ({ ...c, order: i })) } : undefined,
      fields: fields ? { create: fields.map((f, i) => ({ ...f, order: i })) } : undefined,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
