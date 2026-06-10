import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, orderTotal, customerId } = await req.json();

    if (!code || orderTotal === undefined) {
      return NextResponse.json({ valid: false, error: "נתונים חסרים" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "קוד קופון לא תקף" });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "קופון זה אינו פעיל" });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "תוקף הקופון פג" });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "קופון זה הגיע למגבלת השימושים" });
    }

    if (coupon.minOrderAmount !== null && orderTotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        valid: false,
        error: `סכום ההזמנה המינימלי הוא ₪${Number(coupon.minOrderAmount).toLocaleString("he-IL")}`,
      });
    }

    // Check per-user usage if customerId is provided
    if (customerId && coupon.maxUsesPerUser !== null) {
      // We'd need a CouponUsage table for exact tracking; approximating via orders
      const userUsage = await prisma.order.count({
        where: { customerId, couponCode: coupon.code },
      });
      if (userUsage >= coupon.maxUsesPerUser) {
        return NextResponse.json({ valid: false, error: "הגעת למגבלת השימוש בקופון זה" });
      }
    }

    const value = Number(coupon.value);
    let discountAmount: number;
    if (coupon.type === "PERCENT") {
      discountAmount = Math.round((orderTotal * value) / 100);
    } else {
      discountAmount = Math.min(value, orderTotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        type: coupon.type,
        value,
        discountAmount,
      },
    });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json({ valid: false, error: "שגיאה בבדיקת הקופון" }, { status: 500 });
  }
}
