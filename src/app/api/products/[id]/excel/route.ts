import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateExcelTemplate } from "@/lib/excel-generator";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const shippingType = (searchParams.get("shipping") ?? "CONSOLIDATED") as "CONSOLIDATED" | "DIRECT_TO_DONORS";

  const product = await prisma.product.findUnique({
    where: { id },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = generateExcelTemplate({
    productName: product.name,
    fields: product.fields.map((f) => ({
      fieldKey: f.fieldKey,
      label: f.label,
      isRequired: f.isRequired,
    })),
    shippingType,
  });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(product.name)}.xlsx"`,
    },
  });
}
