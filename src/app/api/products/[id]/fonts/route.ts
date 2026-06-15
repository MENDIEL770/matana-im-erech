import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface FontEntry {
  name: string;
  url: string;
}

// POST — upload a new font file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string | null;

  if (!file || !name) {
    return NextResponse.json({ error: "file ו-name חובה" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "ttf";
  const filename = `fonts/${id}/${Date.now()}-${name.replace(/\s+/g, "_")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("products")
    .upload(filename, buffer, { contentType: "font/ttf", upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${filename}`;

  const product = await prisma.product.findUnique({ where: { id }, select: { customFonts: true } });
  const existing: FontEntry[] = (product?.customFonts as unknown as FontEntry[]) ?? [];
  const updated = [...existing, { name, url }];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.product.update({ where: { id }, data: { customFonts: updated as any } });

  return NextResponse.json({ name, url }, { status: 201 });
}

// DELETE — remove a font by url
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { url } = await req.json();

  const product = await prisma.product.findUnique({ where: { id }, select: { customFonts: true } });
  const existing: FontEntry[] = (product?.customFonts as unknown as FontEntry[]) ?? [];
  const updated = existing.filter((f) => f.url !== url);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.product.update({ where: { id }, data: { customFonts: updated as any } });

  return NextResponse.json({ success: true });
}
