"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";

interface SubCategory {
  id: string;
  name: string;
  _count: { products: number };
}

interface MainCategory {
  id: string;
  name: string;
  _count: { products: number };
  children: SubCategory[];
}

interface Props {
  tree: MainCategory[];
  activeId?: string;
}

export function CategoryTree({ tree, activeId }: Props) {
  // Start all main categories expanded
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(tree.map(c => c.id))
  );

  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <nav className="space-y-1">
      <p className="text-[10px] tracking-[0.25em] text-[#6B6763] uppercase mb-4 font-medium px-3">
        קטגוריות
      </p>

      {/* All products */}
      <Link href="/products"
        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
          !activeId ? "bg-[#2E2A26] text-white" : "text-[#6B6763] hover:text-[#2E2A26] hover:bg-white"
        }`}>
        כל המוצרים
      </Link>

      {tree.map(main => {
        const isMainActive = activeId === main.id;
        const hasActiveChild = main.children.some(c => c.id === activeId);
        const open = expanded.has(main.id);

        return (
          <div key={main.id}>
            {/* Main category */}
            <div className="flex items-center gap-1">
              <Link href={`/products?category=${main.id}`}
                className={`flex-1 flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                  isMainActive || hasActiveChild
                    ? "text-[#B08D57]"
                    : "text-[#2E2A26] hover:bg-white"
                }`}>
                <span>{main.name}</span>
                {main.children.length > 0 && (
                  <button type="button" onClick={(e) => { e.preventDefault(); toggle(main.id); }}
                    className="p-0.5 text-gray-400 hover:text-gray-600">
                    {open ? <ChevronDown size={13} /> : <ChevronLeft size={13} />}
                  </button>
                )}
              </Link>
            </div>

            {/* Sub-categories */}
            {open && main.children.length > 0 && (
              <div className="mr-3 border-r border-[#ECE8E2] pr-2 space-y-0.5 mt-0.5 mb-1">
                {main.children.map(sub => (
                  <Link key={sub.id} href={`/products?category=${sub.id}`}
                    className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      activeId === sub.id
                        ? "bg-[#B08D57]/10 text-[#B08D57] font-medium"
                        : "text-[#6B6763] hover:text-[#2E2A26] hover:bg-white"
                    }`}>
                    <span>{sub.name}</span>
                    <span className="text-[10px] text-gray-300">{sub._count.products}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
