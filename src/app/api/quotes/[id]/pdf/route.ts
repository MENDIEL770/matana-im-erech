import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function formatCurrency(n: number) {
  return `₪${n.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function buildQuoteHTML(quote: any): string {
  const items = quote.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #ECE8E2;text-align:right;font-size:13px;color:#2E2A26;">${item.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #ECE8E2;text-align:center;font-size:13px;color:#2E2A26;">${item.quantity}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #ECE8E2;text-align:center;font-size:13px;color:#2E2A26;">${formatCurrency(Number(item.unitPrice))}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #ECE8E2;text-align:center;font-size:13px;font-weight:600;color:#2E2A26;">${formatCurrency(Number(item.total))}</td>
      </tr>`
    )
    .join("");

  const discount = Number(quote.discount);
  const subtotal = Number(quote.subtotal);
  const total = Number(quote.total);
  const validUntil = quote.validUntil
    ? new Date(quote.validUntil).toLocaleDateString("he-IL")
    : "—";
  const createdAt = new Date(quote.createdAt).toLocaleDateString("he-IL");

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>הצעת מחיר ${quote.quoteNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #FAF8F5; color: #2E2A26; direction: rtl; }
  .page { max-width: 820px; margin: 0 auto; background: white; }
  @media print {
    body { background: white; }
    .no-print { display: none !important; }
    .page { box-shadow: none; }
  }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div style="background:#2E2A26;padding:32px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="font-size:22px;font-weight:bold;color:white;letter-spacing:2px;">מתנה עם ערך</div>
      <div style="font-size:11px;color:#B08D57;letter-spacing:3px;margin-top:4px;">MATANA IM ERECH</div>
    </div>
    <div style="text-align:left;">
      <div style="font-size:18px;font-weight:bold;color:#B08D57;">${quote.quoteNumber}</div>
      <div style="font-size:11px;color:#ccc;margin-top:4px;">הצעת מחיר</div>
    </div>
  </div>

  <!-- Info bar -->
  <div style="background:#FAF8F5;padding:20px 40px;display:flex;justify-content:space-between;border-bottom:1px solid #ECE8E2;">
    <div>
      <div style="font-size:10px;color:#6B6763;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">לקוח</div>
      <div style="font-size:14px;font-weight:600;color:#2E2A26;">${quote.customer.shaliachName}</div>
      <div style="font-size:12px;color:#6B6763;">${quote.customer.chabadHouseName}</div>
      <div style="font-size:12px;color:#6B6763;">${quote.customer.phone}</div>
      <div style="font-size:12px;color:#6B6763;">${quote.customer.email}</div>
    </div>
    <div style="text-align:left;">
      <div style="margin-bottom:8px;">
        <div style="font-size:10px;color:#6B6763;text-transform:uppercase;letter-spacing:1px;">תאריך הנפקה</div>
        <div style="font-size:13px;color:#2E2A26;">${createdAt}</div>
      </div>
      <div>
        <div style="font-size:10px;color:#6B6763;text-transform:uppercase;letter-spacing:1px;">בתוקף עד</div>
        <div style="font-size:13px;color:#2E2A26;">${validUntil}</div>
      </div>
    </div>
  </div>

  <!-- Items table -->
  <div style="padding:30px 40px;">
    <table style="width:100%;border-collapse:collapse;border:1px solid #ECE8E2;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#FAF8F5;">
          <th style="padding:12px 14px;text-align:right;font-size:11px;color:#6B6763;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #ECE8E2;">מוצר</th>
          <th style="padding:12px 14px;text-align:center;font-size:11px;color:#6B6763;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #ECE8E2;">כמות</th>
          <th style="padding:12px 14px;text-align:center;font-size:11px;color:#6B6763;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #ECE8E2;">מחיר יחידה</th>
          <th style="padding:12px 14px;text-align:center;font-size:11px;color:#6B6763;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #ECE8E2;">סה"כ</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>

    <!-- Totals -->
    <div style="margin-top:24px;display:flex;justify-content:flex-end;">
      <div style="width:280px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ECE8E2;">
          <span style="font-size:13px;color:#6B6763;">סכום ביניים</span>
          <span style="font-size:13px;color:#2E2A26;">${formatCurrency(subtotal)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ECE8E2;">
          <span style="font-size:13px;color:#6B6763;">הנחה</span>
          <span style="font-size:13px;color:#e53e3e;">-${formatCurrency(discount)}</span>
        </div>` : ""}
        <div style="display:flex;justify-content:space-between;padding:12px 16px;background:#2E2A26;border-radius:6px;margin-top:8px;">
          <span style="font-size:14px;font-weight:bold;color:white;">סה"כ לתשלום</span>
          <span style="font-size:16px;font-weight:bold;color:#B08D57;">${formatCurrency(total)}</span>
        </div>
      </div>
    </div>

    ${quote.notes ? `
    <!-- Notes -->
    <div style="margin-top:24px;padding:16px;background:#FAF8F5;border-right:3px solid #B08D57;border-radius:4px;">
      <div style="font-size:11px;color:#6B6763;margin-bottom:6px;">הערות</div>
      <div style="font-size:13px;color:#2E2A26;">${quote.notes}</div>
    </div>` : ""}
  </div>

  <!-- Footer -->
  <div style="background:#FAF8F5;padding:20px 40px;text-align:center;border-top:1px solid #ECE8E2;">
    <div style="font-size:12px;color:#6B6763;">מתנה עם ערך | מתנות יהודיות עם משמעות שנשארת</div>
    <div style="font-size:11px;color:#B08D57;margin-top:4px;">matana-im-erech.vercel.app</div>
  </div>
</div>
</body>
</html>`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });

  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const html = buildQuoteHTML(quote);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await req.json(); // action: "email" | "print"

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });

  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const html = buildQuoteHTML(quote);

  if (action === "email") {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: "מתנה עם ערך <onboarding@resend.dev>",
      to: [quote.customer.email],
      subject: `הצעת מחיר ${quote.quoteNumber} — מתנה עם ערך`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Update quote status to SENT
    await prisma.quote.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date() },
    });

    return NextResponse.json({ success: true, emailId: data?.id });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
