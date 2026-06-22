import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Package } from "lucide-react";
import { BulkImportButton } from "@/components/admin/BulkImportButton";
import { SearchInput } from "@/components/ui/SearchInput";

async function getProducts(q?: string) {
  try {
    return await prisma.product.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
        ],
      } : undefined,
      include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

const tagLabels: Record<string, { label: string; variant: "gold" | "green" | "navy" | "orange" }> = {
  NEW: { label: "חדש", variant: "green" },
  RECOMMENDED: { label: "מומלץ", variant: "gold" },
  POPULAR: { label: "פופולרי", variant: "navy" },
  PREMIUM: { label: "פרימיום", variant: "orange" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getProducts(q);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
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

      {/* Filters */}
      <Card padding="sm">
        <Suspense>
          <SearchInput placeholder="חיפוש לפי שם, מק״ט..." className="max-w-xs" />
        </Suspense>
      </Card>

      {/* Table */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">מוצר</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">מק"ט</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">קטגוריה</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">מחיר</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">מלאי</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">תג</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const tag = p.tag ? tagLabels[p.tag] : null;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center shrink-0">
                            {p.images[0] ? (
                              <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover rounded-sm" />
                            ) : (
                              <Package size={16} className="text-gray-400" />
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-3 text-gray-600">{p.category?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(Number(p.regularPrice))}</td>
                      <td className="px-4 py-3">
                        <span className={p.stock <= p.minStock ? "text-red-600 font-semibold" : "text-gray-700"}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {tag && <Badge variant={tag.variant}>{tag.label}</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.isActive ? "green" : "gray"}>
                          {p.isActive ? "פעיל" : "מוסתר"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${p.id}`}>
                          <Button variant="ghost" size="sm">עריכה</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
