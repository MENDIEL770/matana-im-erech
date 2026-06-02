import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/public/ProductCard";

const HOLIDAYS = [
  { value: "pesach", label: "פסח" },
  { value: "rosh-hashana", label: "ראש השנה" },
  { value: "chanuka", label: "חנוכה" },
  { value: "purim", label: "פורים" },
  { value: "bar-mitzva", label: "בר מצווה" },
  { value: "chanokat-bait", label: "חנוכת בית" },
  { value: "shavuot", label: "שבועות" },
  { value: "sukkot", label: "סוכות" },
];

async function ProductsGrid({
  holiday,
  categoryId,
}: {
  holiday?: string;
  categoryId?: string;
}) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(holiday ? { holidays: { has: holiday } } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      images: { orderBy: { order: "asc" } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  if (products.length === 0) {
    return (
      <div className="col-span-4 py-24 text-center">
        <p className="text-[#6B6763] text-lg">לא נמצאו מוצרים</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-[#B08D57] hover:underline">
          לצפייה בכל המוצרים
        </Link>
      </div>
    );
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          shortDescription={product.shortDescription}
          tag={product.tag}
          regularPrice={Number(product.regularPrice)}
          price20={product.price20 ? Number(product.price20) : null}
          price500={product.price500 ? Number(product.price500) : null}
          images={product.images}
        />
      ))}
    </>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ holiday?: string; category?: string }>;
}) {
  const { holiday, category } = await searchParams;

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#ECE8E2] py-14 px-6 text-center">
        <p className="text-[11px] tracking-[0.3em] text-[#B08D57] uppercase mb-3">קטלוג</p>
        <h1 className="font-['Ploni'] font-light text-[#2E2A26] text-4xl lg:text-5xl">
          {holiday ? HOLIDAYS.find((h) => h.value === holiday)?.label ?? "מוצרים" : "כל המוצרים"}
        </h1>
        <div className="mt-5 mx-auto w-12 h-px bg-[#B08D57]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10" dir="rtl">
          {/* Sidebar filters */}
          <aside className="lg:w-56 shrink-0 space-y-8">
            {/* Holidays */}
            <div>
              <p className="text-[10px] tracking-[0.25em] text-[#6B6763] uppercase mb-4 font-medium">
                חגים ואירועים
              </p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/products"
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      !holiday && !category
                        ? "bg-[#2E2A26] text-white"
                        : "text-[#6B6763] hover:text-[#2E2A26] hover:bg-white"
                    }`}
                  >
                    כל המוצרים
                  </Link>
                </li>
                {HOLIDAYS.map((h) => (
                  <li key={h.value}>
                    <Link
                      href={`/products?holiday=${h.value}`}
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        holiday === h.value
                          ? "bg-[#2E2A26] text-white"
                          : "text-[#6B6763] hover:text-[#2E2A26] hover:bg-white"
                      }`}
                    >
                      {h.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.25em] text-[#6B6763] uppercase mb-4 font-medium">
                  קטגוריות
                </p>
                <ul className="space-y-1">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/products?category=${cat.id}`}
                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                          category === cat.id
                            ? "bg-[#2E2A26] text-white"
                            : "text-[#6B6763] hover:text-[#2E2A26] hover:bg-white"
                        }`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Product grid */}
          <main className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              <Suspense
                fallback={Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#ECE8E2] rounded-2xl animate-pulse"
                    style={{ aspectRatio: "0.85" }}
                  />
                ))}
              >
                <ProductsGrid holiday={holiday} categoryId={category} />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
