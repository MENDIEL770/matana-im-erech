import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { InventoryUpdateForm } from "@/components/admin/InventoryUpdateForm";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      minStock: true,
      warehouseLocation: true,
      category: { select: { name: true } },
    },
    orderBy: { stock: "asc" },
  });

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-[&apos;Ploni&apos;] font-bold text-[#0F2747]">ניהול מלאי</h1>
        <p className="text-sm text-gray-500 mt-1">עקוב אחר מלאי המוצרים ועדכן כמויות</p>
      </div>

      {/* Low stock alert */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="space-y-2">
          {outOfStockProducts.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{outOfStockProducts.length} מוצרים אזלו מהמלאי</span>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-sm">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{lowStockProducts.length} מוצרים מתחת למלאי המינימום</span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <Card padding="none">
        <CardHeader className="p-6 border-b border-gray-100">
          <CardTitle>כל המוצרים</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-right px-6 py-3 font-medium text-gray-600">מוצר</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">מק&quot;ט</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">קטגוריה</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">כמות</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">מינימום</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">מיקום</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    אין מוצרים במערכת
                  </td>
                </tr>
              )}
              {products.map((p) => {
                const isOut = p.stock === 0;
                const isLow = !isOut && p.stock <= p.minStock;
                let statusLabel = "תקין";
                let statusClass = "bg-green-100 text-green-700";
                if (isOut) { statusLabel = "אזל"; statusClass = "bg-red-100 text-red-600"; }
                else if (isLow) { statusLabel = "מלאי נמוך"; statusClass = "bg-orange-100 text-orange-600"; }

                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#0F2747]">{p.name}</td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-4 text-gray-600">{p.category?.name ?? "—"}</td>
                    <td className={`px-4 py-4 font-semibold ${isOut ? "text-red-600" : isLow ? "text-orange-600" : "text-gray-700"}`}>
                      {p.stock}
                    </td>
                    <td className="px-4 py-4 text-gray-500">{p.minStock}</td>
                    <td className="px-4 py-4 text-gray-500">{p.warehouseLocation ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-sm text-xs font-medium ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <InventoryUpdateForm productId={p.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
