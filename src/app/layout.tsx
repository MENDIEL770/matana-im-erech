import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מתנה עם ערך | מתנות יהודיות עם משמעות שנשארת",
  description: "מתנות יהודיות יוקרתיות לשלוחי חב״ד. מיתוג אישי, חריטה, רקמה ומשלוח לכל העולם.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
