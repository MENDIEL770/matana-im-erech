"use client";

import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const categories = [
  {
    name: "פסח",
    slug: "pesach",
    image: "https://images.unsplash.com/photo-1552912090-62c4ef7f9fa8?w=600&q=80",
  },
  {
    name: "ראש השנה",
    slug: "rosh-hashana",
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80",
  },
  {
    name: "חנוכה",
    slug: "chanuka",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&q=80",
  },
  {
    name: "פורים",
    slug: "purim",
    image: "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=600&q=80",
  },
  {
    name: "בר מצווה",
    slug: "bar-mitzva",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  },
  {
    name: "חנוכת בית",
    slug: "chanokat-bait",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
  },
];

const features = [
  { label: "מיתוג אישי",       sub: "חריטה, רקמה והטבעה לוגו" },
  { label: "משלוח עולמי",      sub: "לכל שליח בכל מקום" },
  { label: "מינימום 20 יחידות", sub: "מחירים לפי כמות" },
  { label: "שירות מקצועי",     sub: "ליווי מהזמנה עד מסירה" },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative bg-[#FAF8F5] overflow-hidden" style={{ minHeight: "88vh" }}>

        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=1800&q=85"
            alt="Hero"
            fill
            className="object-cover object-center opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/60 via-transparent to-[#FAF8F5]/80" />
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24" style={{ minHeight: "88vh" }}>

          {/* Eyebrow */}
          <ScrollReveal variant="fade" delay={0.1}>
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-12 bg-[#B08D57]" />
              <span className="text-[11px] tracking-[0.3em] text-[#B08D57] uppercase font-medium">
                Premium Judaica Gifts
              </span>
              <div className="h-px w-12 bg-[#B08D57]" />
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal variant="up" delay={0.2} duration={0.8}>
            <h1
              className="font-['Ploni'] font-light text-[#2E2A26] leading-tight mb-6"
              style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
            >
              מתנה עם ערך
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={0.4}>
            <p className="text-[#6B6763] text-lg font-light max-w-sm mb-12 leading-relaxed">
              מתנות יהודיות עם משמעות שנשארת
            </p>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={0.6}>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#2E2A26] text-white text-sm tracking-widest uppercase hover:bg-[#B08D57] transition-colors duration-300"
            >
              לצפייה בקטלוג
            </Link>
          </ScrollReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-10 bg-[#2E2A26] animate-pulse" />
        </div>
      </section>

      {/* ── Features bar ─────────────────────────────────── */}
      <section className="bg-white border-y border-[#ECE8E2]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-x-reverse divide-[#ECE8E2]">
            {features.map(({ label, sub }, i) => (
              <ScrollReveal key={label} variant="up" delay={i * 0.1} duration={0.5}>
                <div className="text-center px-6">
                  <p className="text-sm font-semibold text-[#2E2A26] mb-1">{label}</p>
                  <p className="text-xs text-[#6B6763]">{sub}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="bg-[#FAF8F5] py-28 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <ScrollReveal variant="up" duration={0.7}>
            <div className="text-center mb-16">
              <p className="text-[11px] tracking-[0.3em] text-[#B08D57] uppercase mb-4">קולקציות</p>
              <h2 className="font-['Ploni'] font-light text-[#2E2A26] text-4xl lg:text-5xl">
                מתנות לכל אירוע
              </h2>
              <div className="gold-line mt-6" />
            </div>
          </ScrollReveal>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <ScrollReveal key={cat.slug} variant="up" delay={i * 0.08} duration={0.6}>
                <Link href={`/products?holiday=${cat.slug}`} className="category-card group block">
                  {/* Image */}
                  <div className="relative overflow-hidden bg-[#E9E2D8]" style={{ aspectRatio: "4/3" }}>
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[#2E2A26]/0 group-hover:bg-[#2E2A26]/10 transition-colors duration-500" />
                  </div>

                  {/* Caption */}
                  <div className="bg-white px-6 py-5 flex items-center justify-between border-t border-[#ECE8E2]">
                    <span className="font-['Ploni'] text-[#2E2A26] font-medium">{cat.name}</span>
                    <span className="text-[#B08D57] text-lg leading-none">←</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────── */}
      <section className="bg-white py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal variant="scale" duration={0.8}>
            <div className="gold-line mb-10" />
            <h2
              className="font-['Ploni'] font-light text-[#2E2A26] leading-relaxed mb-8"
              style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)" }}
            >
              "כל מתנה היא הזדמנות ליצור קשר שנשאר"
            </h2>
            <p className="text-[#6B6763] text-base leading-relaxed max-w-xl mx-auto">
              אנו מלווים שלוחי חב״ד ברחבי העולם במציאת המתנה המושלמת — מיתוג אישי,
              איכות יוקרתית, ומשלוח לכל יעד בעולם.
            </p>
            <div className="gold-line mt-10" />
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-[#2E2A26] py-28 px-6 text-center">
        <ScrollReveal variant="up" delay={0.1}>
          <p className="text-[11px] tracking-[0.3em] text-[#B08D57] uppercase mb-6">מוכנים להתחיל?</p>
          <h2
            className="font-['Ploni'] font-light text-white mb-10 leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            הצטרפו למשפחת מתנה עם ערך
          </h2>
        </ScrollReveal>
        <ScrollReveal variant="up" delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-4 bg-[#B08D57] text-white text-sm tracking-widest uppercase hover:bg-[#9a7a48] transition-colors duration-300"
            >
              הרשמה חינם
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-10 py-4 border border-white/30 text-white text-sm tracking-widest uppercase hover:border-white/60 transition-colors duration-300"
            >
              לצפייה בקטלוג
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
