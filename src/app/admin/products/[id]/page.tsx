import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { FontUploader } from "@/components/admin/FontUploader";
import { BundleEditor } from "@/components/admin/BundleEditor";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

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

  // Serialize Decimals to plain numbers for client components
  const serialized = JSON.parse(JSON.stringify(product));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/admin/products"
              className="hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <ArrowRight size={14} />
              חזור לרשימה
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-['Ploni'] text-2xl text-[#0F2747] font-light">
              {product.name}
            </h1>
            <Badge variant="gray" className="font-mono text-xs">
              {product.sku}
            </Badge>
          </div>
        </div>
        <Link href="/admin/products/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#B08D57] text-white text-sm rounded-sm hover:bg-[#9a7a48] transition-colors">
            <Plus size={14} />
            מוצר חדש
          </button>
        </Link>
      </div>

      {/* Bundle Editor — מוצג רק אם המוצר הוא מארז */}
      {product.isBundle && (
        <BundleEditor productId={product.id} />
      )}

      {/* Main layout: Left 60% form | Right 40% images */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Product Form (60%) */}
        <div className="w-full lg:w-[60%]">
          <ProductForm product={serialized} />
        </div>

        {/* Right: Image Uploader (40%) */}
        <div className="w-full lg:w-[40%] sticky top-6">
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-[#0F2747] text-sm">תמונות מוצר</h2>
            <ImageUploader
              productId={product.id}
              initialImages={serialized.images}
            />
          </div>

          {product.isCustomizable && (
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5 space-y-4">
              <div>
                <h2 className="font-semibold text-[#0F2747] text-sm">פונטים לעיצוב אישי</h2>
                <p className="text-xs text-gray-400 mt-1">הלקוח יבחר מתוך הפונטים שתעלה כאן</p>
              </div>
              <FontUploader
                productId={product.id}
                initialFonts={(serialized.customFonts as { name: string; url: string }[]) ?? []}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
