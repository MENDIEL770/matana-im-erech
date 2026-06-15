import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { identifier, method } = await req.json();
  // identifier = email or phone, method = "email" | "sms"

  if (!identifier || !method) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });
  }

  // Find user
  const isEmail = identifier.includes("@");
  const user = isEmail
    ? await prisma.user.findUnique({ where: { email: identifier } })
    : await prisma.user.findFirst({ where: { customer: { phone: identifier } }, include: { customer: true } });

  // Always return success to prevent enumeration
  if (!user) return NextResponse.json({ success: true });

  // Delete old tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { identifier: user.email } });

  const token = crypto.randomInt(100000, 999999).toString(); // 6-digit code
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.passwordResetToken.create({
    data: { identifier: user.email, token, expires },
  });

  if (method === "email") {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "מתנה עם ערך <noreply@matana.co.il>",
        to: user.email,
        subject: "איפוס סיסמה — מתנה עם ערך",
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;">
            <h2 style="color:#0F2747;font-weight:400;">איפוס סיסמה</h2>
            <p style="color:#6B6763;font-size:14px;">קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
            <div style="background:#FAF8F5;border:1px solid #ECE8E2;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B6763;text-transform:uppercase;letter-spacing:2px;">קוד האימות שלך</p>
              <p style="font-size:40px;font-weight:700;color:#0F2747;letter-spacing:10px;margin:0;">${token}</p>
              <p style="margin:8px 0 0;font-size:11px;color:#CFC5B8;">תקף ל-15 דקות בלבד</p>
            </div>
            <p style="color:#6B6763;font-size:12px;">אם לא ביקשת איפוס סיסמה, התעלם מהודעה זו.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("[ForgotPassword] Email error:", e);
    }
  } else if (method === "sms") {
    // Find phone
    const customer = await prisma.customer.findFirst({ where: { userId: user.id } });
    const phone = customer?.phone;
    if (phone) {
      try {
        const { smsProvider } = await import("@/lib/sms/yemot");
        await smsProvider.send(phone, `קוד האימות שלך במתנה עם ערך: ${token}. תקף ל-15 דקות`);
      } catch (e) {
        console.error("[ForgotPassword] SMS error:", e);
      }
    }
  }

  return NextResponse.json({ success: true });
}
