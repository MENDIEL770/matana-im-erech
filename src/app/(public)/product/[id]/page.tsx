// Server component — data fetching here, interactive UI in ProductDetail (client)
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "./ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, isActive: true },
    include: {
      images: { orderBy: { order: "asc" } },
      fields: { orderBy: { order: "asc" } },
      costs: { orderBy: { order: "asc" } },
      category: true,
    },
  });

  if (!product) notFound();

  // Serialize Decimal to number
  const serialized = JSON.parse(JSON.stringify(product));

  return <ProductDetail product={serialized} />;
}
