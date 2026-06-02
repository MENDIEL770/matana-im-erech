import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const cols = [
  {
    title: "קטגוריות",
    links: [
      { href: "/products?holiday=pesach",       label: "פסח" },
      { href: "/products?holiday=rosh-hashana", label: "ראש השנה" },
      { href: "/products?holiday=chanuka",      label: "חנוכה" },
      { href: "/products?holiday=purim",        label: "פורים" },
      { href: "/products?holiday=bar-mitzva",   label: "בר מצווה" },
    ],
  },
  {
    title: "שירות לקוחות",
    links: [
      { href: "/quote",    label: "הצעת מחיר" },
      { href: "/register", label: "הרשמה" },
      { href: "/login",    label: "כניסה לחשבון" },
      { href: "/faq",      label: "שאלות נפוצות" },
    ],
  },
  {
    title: "אודות",
    links: [
      { href: "/about",   label: "על החברה" },
      { href: "/catalog", label: "קטלוגים להורדה" },
      { href: "/agents",  label: "הצטרפות כסוכן" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#ECE8E2]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-5">
              <p className="font-['Ploni'] text-lg font-bold tracking-widest text-[#2E2A26] uppercase">מתנה עם ערך</p>
              <p className="text-[10px] tracking-[0.3em] text-[#B08D57] uppercase mt-0.5">Matana Im Erech</p>
            </Link>
            <p className="text-sm text-[#6B6763] leading-relaxed max-w-xs">
              מתנות יהודיות יוקרתיות לשלוחי חב״ד ברחבי העולם. מיתוג אישי ומשלוח לכל יעד.
            </p>
            <div className="mt-6 space-y-2.5">
              <a href="tel:+972500000000" className="flex items-center gap-2.5 text-sm text-[#6B6763] hover:text-[#2E2A26] transition-colors">
                <Phone size={14} strokeWidth={1.5} className="text-[#B08D57]" />
                <span>050-0000000</span>
              </a>
              <a href="mailto:info@matana.co.il" className="flex items-center gap-2.5 text-sm text-[#6B6763] hover:text-[#2E2A26] transition-colors">
                <Mail size={14} strokeWidth={1.5} className="text-[#B08D57]" />
                <span>info@matana.co.il</span>
              </a>
              <div className="flex items-center gap-2.5 text-sm text-[#6B6763]">
                <MapPin size={14} strokeWidth={1.5} className="text-[#B08D57]" />
                <span>ישראל</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold tracking-[0.15em] text-[#2E2A26] uppercase mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-[#6B6763] hover:text-[#2E2A26] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-[#ECE8E2] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#6B6763]">
            © {new Date().getFullYear()} מתנה עם ערך. כל הזכויות שמורות.
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-[#B08D57]" />
            <p className="text-xs text-[#B08D57] tracking-widest uppercase">Premium Judaica Gifts</p>
            <div className="w-1 h-1 rounded-full bg-[#B08D57]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
