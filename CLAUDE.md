# מתנה עם ערך — Project Guide

## Stack
- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** (RTL, Hebrew)
- **Prisma 7** + PostgreSQL (with `@prisma/adapter-pg`)
- **NextAuth.js** (JWT, Credentials provider)
- **Roles**: ADMIN | CUSTOMER | AGENT

## Commands
```bash
npm run dev          # Dev server on port 3001
npm run db:migrate   # Run DB migrations
npm run db:studio    # Prisma Studio GUI
npm run db:push      # Push schema without migration
```

## Brand Colors
- Navy `#0F2747` — primary
- Gold `#B08D57` — accent
- Cream `#F8F5EE` — background
- Always RTL, Hebrew

## Key Architecture
- `src/app/(public)/` — public website (Navbar + Footer)
- `src/app/(auth)/` — login/register (centered layout)
- `src/app/admin/` — admin panel (sidebar + header, role: ADMIN)
- `src/app/dashboard/` — customer portal (role: CUSTOMER)
- `src/app/api/` — API routes
- `src/lib/` — Prisma, Auth, SMS/Payment/Shipping abstraction layers
- `src/components/ui/` — Button, Input, Select, Card, Badge
- `src/components/admin/` — AdminSidebar, AdminHeader, ProductForm
- `src/components/public/` — Navbar, Footer

## Prisma (v7)
Always use the pg adapter in `src/lib/prisma.ts`.
Run `npm run db:generate` after schema changes.

## Abstraction Layers (placeholders — fill when credentials arrive)
- SMS: `src/lib/sms/yemot.ts` (ימות המשיח)
- Payments: `src/lib/payments/provider.ts`
- Shipping: `src/lib/shipping/provider.ts`
- Invoices: `src/lib/invoices/provider.ts`

## IMPORTANT — After Every Completed Task
After completing any task, always show the user the next available steps using AskUserQuestion with the next 4 options from the project roadmap below. This is mandatory — never finish a task without showing the next steps.

## Project Roadmap (Priority Order)
1. **מוצרים** — הוספת מוצר עם תמונות (Supabase Storage), עריכה, מחיקה
2. **קטלוג ציבורי** — עמוד מוצרים עם פילטרים, דף מוצר בודד
3. **הצעות מחיר** — בניה, PDF, שליחה ב-WhatsApp, המרה להזמנה
4. **הזמנות** — ניהול סטטוסים, SMS אוטומטי, Excel upload
5. **אזור לקוח** — dashboard ללקוח מחובר
6. **CRM** — ניהול לידים עם timeline, משימות, תזכורות
7. **סוכנים** — ניהול סוכנים + חישוב עמלות
8. **קופונים** — יצירה, תוקף, הגבלות
9. **דוחות** — רווחיות, חישוב שותפים, גרפים
10. **השקה** — Vercel deployment + דומיין

## Smart Product Engine
Products have configurable `ProductField` rows. `generateExcelTemplate()` in
`src/lib/excel-generator.ts` builds a download Excel from those fields.
The `GET /api/products/[id]/excel?shipping=CONSOLIDATED` endpoint serves it.
