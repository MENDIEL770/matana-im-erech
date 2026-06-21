import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/public/ProductCard";
import { CategoryTree } from "@/components/public/CategoryTree";

export const revalidate = 300;

async function ProductsGrid({ categoryId }: { categoryId?: string }) {
  // If categoryId is a main category, include all its sub-categories
  const subCategoryIds = categoryId
    ? (await prisma.category.findMany({ where: { parentId: categoryId }, select: { id: true } })).map(c => c.id)
    : [];

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoryId
        ? { categoryId: subCategoryIds.length > 0 ? { in: [categoryId, ...subCategoryIds] } : categoryId }
        : {}),
    },
    include: { images: { orderBy: { order: "asc" } } },
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
          orderMode={product.orderMode}
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
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // Fetch tree for sidebar
  const tree = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      children: {
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  // Active category name for header
  const activeCategory = category
    ? await prisma.category.findUnique({ where: { id: category }, select: { name: true } })
    : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#ECE8E2] py-14 px-6 text-center">
        <p className="text-[11px] tracking-[0.3em] text-[#B08D57] uppercase mb-3">קטלוג</p>
        <h1 className="font-['Ploni'] font-light text-[#2E2A26] text-4xl lg:text-5xl">
          {activeCategory?.name ?? "כל המוצרים"}
        </h1>
        <div className="mt-5 mx-auto w-12 h-px bg-[#B08D57]" />
      </div>

      {/* Mobile filter bar */}
      <div className="lg:hidden bg-white border-b border-[#ECE8E2] px-4 py-3 overflow-x-auto" dir="rtl">
        <div className="flex gap-2 w-max">
          <Link href="/products"
            className={`whitespace-nowrap px-4 py-2 text-sm rounded-full transition-colors ${!category ? "bg-[#2E2A26] text-white" : "bg-[#FAF8F5] text-[#6B6763]"}`}>
            הכל
          </Link>
          {tree.map(main => (
            <Link key={main.id} href={`/products?category=${main.id}`}
              className={`whitespace-nowrap px-4 py-2 text-sm rounded-full transition-colors ${category === main.id ? "bg-[#2E2A26] text-white" : "bg-[#FAF8F5] text-[#6B6763]"}`}>
              {main.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-10" dir="rtl">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:w-56 shrink-0">
            <CategoryTree tree={tree} activeId={category} />
          </aside>

          {/* Product grid */}
          <main className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
              <Suspense fallback={Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-[#ECE8E2] rounded-2xl animate-pulse" style={{ aspectRatio: "0.85" }} />
              ))}>
                <ProductsGrid categoryId={category} />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
