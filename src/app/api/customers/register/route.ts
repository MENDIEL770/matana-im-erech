import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  chabadHouseName: z.string().min(1),
  shaliachName: z.string().min(1),
  phone: z.string().regex(/^05\d{8}$/, "מספר טלפון לא תקין — נדרש פורמט: 05XXXXXXXX"),
  email: z.string().email(),
  password: z.string().min(6),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  businessNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "נתונים שגויים" }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: rest.email } });
  if (existing) {
    return NextResponse.json({ error: "כתובת אימייל זו כבר רשומה" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

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
        },
      },
    },
  });

  return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
}
