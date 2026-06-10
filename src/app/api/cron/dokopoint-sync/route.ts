import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncProductsFromDokopoint, syncCustomersFromDokopoint } from "@/lib/dokopoint";

export const dynamic = "force-dynamic";

// Protect cron with secret
function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

async function getLastSyncDate(): Promise<string | undefined> {
  const log = await prisma.dokopointSyncLog.findFirst({
    where: { status: "success", entityType: "cron" },
    orderBy: { createdAt: "desc" },
  });
  return log?.createdAt?.toISOString();
}

async function saveLastSyncDate() {
  await prisma.dokopointSyncLog.create({
    data: { entityType: "cron", action: "sync", status: "success" },
  });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const since = await getLastSyncDate();

    // Sync products from Dokopoint → our DB
    const products = await syncProductsFromDokopoint(since);
    console.log(`[Dokopoint Sync] Products: ${Array.isArray((products as any)?.data) ? (products as any).data.length : 0}`);

    // Sync customers from Dokopoint → our DB
    const customers = await syncCustomersFromDokopoint(since);
    console.log(`[Dokopoint Sync] Customers: ${Array.isArray((customers as any)?.data) ? (customers as any).data.length : 0}`);

    await saveLastSyncDate();

    return NextResponse.json({ ok: true, since: since ?? "first_run" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
