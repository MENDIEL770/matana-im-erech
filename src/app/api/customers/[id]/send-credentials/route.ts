import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return NextResponse.json({ error: "לקוח לא נמצא" }, { status: 404 });

  // Create a password reset token so customer can set new password
  await prisma.passwordResetToken.deleteMany({ where: { identifier: customer.email } });
  const token = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await prisma.passwordResetToken.create({ data: { identifier: customer.email, token, expires } });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://matana-im-erech.vercel.app";
  const resetUrl = `${baseUrl}/forgot-password`;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "מתנה עם ערך <onboarding@resend.dev>",
      to: customer.email,
      subject: "פרטי הכניסה שלך — מתנה עם ערך",
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#FAF8F5;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
          <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid #ECE8E2;border-radius:8px;overflow:hidden;">
            <div style="background:#0F2747;padding:28px 36px;text-align:center;">
              <h1 style="color:#B08D57;font-size:24px;margin:0;font-weight:300;letter-spacing:2px;">מתנה עם ערך</h1>
            </div>
            <div style="padding:36px;">
              <h2 style="color:#0F2747;font-size:18px;font-weight:400;margin:0 0 12px;">שלום ${customer.shaliachName},</h2>
              <p style="color:#6B6763;font-size:14px;line-height:1.8;margin:0 0 20px;">
                הנה פרטי הכניסה שלך למערכת מתנה עם ערך:
              </p>
              <div style="background:#FAF8F5;border-radius:6px;padding:20px;margin-bottom:20px;border:1px solid #ECE8E2;">
                <p style="margin:4px 0;font-size:14px;color:#2E2A26;"><strong>אימייל:</strong> ${customer.email}</p>
                <p style="margin:12px 0 4px;font-size:13px;color:#6B6763;">לאיפוס הסיסמה — לחץ על הכפתור למטה והכנס את הקוד:</p>
                <p style="font-size:32px;font-weight:700;color:#0F2747;letter-spacing:8px;text-align:center;margin:12px 0;">${token}</p>
                <p style="font-size:11px;color:#CFC5B8;text-align:center;margin:0;">תקף ל-24 שעות</p>
              </div>
              <a href="${resetUrl}" style="display:block;text-align:center;background:#B08D57;color:#fff;padding:13px 24px;border-radius:4px;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:500;margin-bottom:20px;">
                כניסה למערכת
              </a>
              <p style="color:#CFC5B8;font-size:11px;text-align:center;margin:0;">
                שאלות? <a href="mailto:info@matana.co.il" style="color:#B08D57;">info@matana.co.il</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (e) {
    console.error("[SendCredentials]", e);
    return NextResponse.json({ error: "שגיאה בשליחת המייל" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
