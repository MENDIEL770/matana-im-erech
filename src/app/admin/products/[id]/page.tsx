import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      costs: { orderBy: { order: "asc" } },
      fields: { orderBy: { order: "asc" } },
      category: true,
    },
  });

  if (!product) notFound();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6B6763]">
        <Link href="/admin/products" className="hover:text-[#2E2A26] transition-colors flex items-center gap-1">
          <ArrowRight size={14} />
          מוצרים
        </Link>
        <span>/</span>
        <span className="text-[#2E2A26] font-medium">{product.name}</span>
      </div>

      <div>
        <h1 className="font-['Ploni'] text-2xl text-[#2E2A26] font-light">עריכת מוצר</h1>
        <p className="text-sm text-[#6B6763] mt-1">מק"ט: {product.sku}</p>
      </div>

      {/* Images section */}
      <div className="bg-white border border-[#ECE8E2] rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-[#2E2A26]">תמונות מוצר</h2>
        <ImageUploader
          productId={product.id}
          initialImages={product.images.map((img) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            isHover: img.isHover,
            order: img.order,
          }))}
        />
      </div>

      {/* Product form */}
      <ProductForm product={product} />
    </div>
  );
}
