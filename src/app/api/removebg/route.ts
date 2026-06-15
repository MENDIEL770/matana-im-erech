import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "חסר קובץ" }, { status: 400 });

  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "REMOVEBG_API_KEY חסר" }, { status: 500 });

  const body = new FormData();
  body.append("image_file", file);
  body.append("size", "auto");

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
}
