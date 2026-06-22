import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus, Package } from "lucide-react";
import { BulkImportButton } from "@/components/admin/BulkImportButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { ProductsTableClient } from "@/components/admin/ProductsTableClient";

async function getData(q?: string) {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
          ],
        } : undefined,
        include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    return { products, categories };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { products, categories } = await getData(q);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2747]">מוצרים</h1>
          <p className="text-sm text-gray-500">{products.length} מוצרים במערכת</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportButton />
          <Link href="/admin/products/new">
            <Button variant="gold">
              <Plus size={16} />
              מוצר חדש
            </Button>
          </Link>
        </div>
      </div>

      <Card padding="sm">
        <Suspense>
          <SearchInput placeholder="חיפוש לפי שם, מק״ט..." className="max-w-xs" />
        </Suspense>
      </Card>

      <Card padding="none">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package size={48} className="mb-3 opacity-30" />
            <p className="font-medium">אין מוצרים עדיין</p>
            <p className="text-sm mt-1">הוסף את המוצר הראשון שלך</p>
            <Link href="/admin/products/new" className="mt-4">
              <Button variant="gold" size="sm">
                <Plus size={14} />
                הוסף מוצר
              </Button>
            </Link>
          </div>
        ) : (
          <ProductsTableClient
            products={products.map(p => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              regularPrice: Number(p.regularPrice),
              stock: p.stock,
              minStock: p.minStock,
              isActive: p.isActive,
              tag: p.tag,
              orderMode: p.orderMode,
              category: p.category ? { id: p.category.id, name: p.category.name } : null,
              images: p.images,
            }))}
            categories={categories.map(c => ({ id: c.id, name: c.name }))}
          />
        )}
      </Card>
    </div>
  );
}
