import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const body = await req.json();
  const { type, content, createdBy } = body as {
    type: ActivityType;
    content: string;
    createdBy?: string;
  };

  if (!type || !content) {
    return NextResponse.json({ error: "type and content are required" }, { status: 400 });
  }

  const validTypes: ActivityType[] = ["NOTE", "CALL", "EMAIL", "MEETING", "WHATSAPP", "STATUS_CHANGE"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
  }

  const activity = await prisma.leadActivity.create({
    data: {
      leadId: id,
      type,
      content,
      createdBy: createdBy ?? null,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
