import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  chabadHouseName: z.string().min(1),
  shaliachName: z.string().min(1),
  phone: z.string().regex(/^05\d{8}$/, "מספר טלפון לא תקין — נדרש פורמט: 05XXXXXXXX"),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  businessNumber: z.string().optional(),
  privacyConsent: z.string().or(z.boolean()),
  marketingConsent: z.string().or(z.boolean()).optional(),
  directDebitInterest: z.string().or(z.boolean()).optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"],
}).refine((d) => d.privacyConsent === "on" || d.privacyConsent === true || d.privacyConsent === "true", {
  message: "יש לאשר את מדיניות הפרטיות",
  path: ["privacyConsent"],
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "נתונים שגויים";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { password, confirmPassword: _c, privacyConsent: _p, marketingConsent, directDebitInterest, ...rest } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: rest.email } });
  if (existing) {
    return NextResponse.json({ error: "כתובת אימייל זו כבר רשומה" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const toBool = (v: string | boolean | undefined) => v === true || v === "on" || v === "true";

  const user = await prisma.user.create({
    data: {
      email: rest.email,
      password: hashed,
      name: rest.shaliachName,
      role: "CUSTOMER",
      customer: {
        create: {
          chabadHouseName: rest.chabadHouseName,
          shaliachName: rest.shaliachName,
          phone: rest.phone,
          email: rest.email,
          address: rest.address,
          country: rest.country,
          website: rest.website || undefined,
          businessNumber: rest.businessNumber,
          marketingConsent: toBool(marketingConsent),
          directDebitInterest: toBool(directDebitInterest),
        },
      },
    },
    include: { customer: true },
  });

  // Send welcome email
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const directDebit = toBool(directDebitInterest);

    await resend.emails.send({
      from: "מתנה עם ערך <noreply@matana.co.il>",
      to: rest.email,
      subject: "ברוכים הבאים למשפחת מתנה עם ערך! 🎁",
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#FAF8F5;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
          <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #ECE8E2;border-radius:8px;overflow:hidden;">
            <div style="background:#0F2747;padding:32px 40px;text-align:center;">
              <h1 style="color:#B08D57;font-size:28px;margin:0;font-weight:300;letter-spacing:2px;">מתנה עם ערך</h1>
              <p style="color:#fff;margin:8px 0 0;font-size:13px;opacity:0.7;">מתנות יהודיות בהזמנה אישית</p>
            </div>
            <div style="padding:40px;">
              <h2 style="color:#0F2747;font-size:20px;font-weight:400;margin:0 0 16px;">שלום ${rest.shaliachName},</h2>
              <p style="color:#6B6763;font-size:14px;line-height:1.8;margin:0 0 24px;">
                ברוכים הבאים למשפחת <strong style="color:#B08D57;">מתנה עם ערך</strong>!<br>
                ההרשמה שלכם הושלמה בהצלחה.
              </p>
              <div style="background:#FAF8F5;border-radius:6px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;color:#6B6763;font-weight:600;text-transform:uppercase;letter-spacing:1px;">פרטי החשבון</p>
                <p style="margin:4px 0;font-size:14px;color:#2E2A26;"><strong>שם:</strong> ${rest.shaliachName}</p>
                <p style="margin:4px 0;font-size:14px;color:#2E2A26;"><strong>בית חב"ד:</strong> ${rest.chabadHouseName}</p>
                <p style="margin:4px 0;font-size:14px;color:#2E2A26;"><strong>אימייל:</strong> ${rest.email}</p>
                <p style="margin:4px 0;font-size:14px;color:#2E2A26;"><strong>טלפון:</strong> ${rest.phone}</p>
              </div>
              ${directDebit ? `
              <div style="background:#FFF8E7;border:1px solid #B08D57;border-radius:6px;padding:16px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#B08D57;font-weight:600;">✅ הוראת קבע — 3% הנחה</p>
                <p style="margin:6px 0 0;font-size:13px;color:#6B6763;">ציינת עניין בהוראת קבע לקבלת 3% הנחה בכל רכישה. נציג שלנו יצור איתך קשר בקרוב לסידור הפרטים.</p>
              </div>` : ""}
              <a href="${process.env.NEXTAUTH_URL ?? "https://matana-im-erech.vercel.app"}/products"
                style="display:block;text-align:center;background:#B08D57;color:#fff;padding:14px 24px;border-radius:4px;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:500;margin-bottom:24px;">
                לצפייה בקטלוג המוצרים
              </a>
              <p style="color:#CFC5B8;font-size:12px;text-align:center;margin:0;">
                © 2025 מתנה עם ערך | לשאלות: <a href="mailto:info@matana.co.il" style="color:#B08D57;">info@matana.co.il</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Notify admin if direct debit interest
    if (directDebit) {
      await resend.emails.send({
        from: "מתנה עם ערך <noreply@matana.co.il>",
        to: "admin@matana.co.il",
        subject: `לקוח חדש מעוניין בהוראת קבע — ${rest.shaliachName}`,
        html: `<p>לקוח חדש נרשם ומעוניין בהוראת קבע (3% הנחה):</p>
          <ul>
            <li>שם: ${rest.shaliachName}</li>
            <li>בית חב"ד: ${rest.chabadHouseName}</li>
            <li>אימייל: ${rest.email}</li>
            <li>טלפון: ${rest.phone}</li>
          </ul>`,
      });
    }
  } catch (e) {
    console.error("[Register] Email error:", e);
  }

  return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
}
