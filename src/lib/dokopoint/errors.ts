import { prisma } from "@/lib/prisma";

export class DokopointError extends Error {
  constructor(
    public statusCode: number,
    public dokopointCode: string,
    message: string
  ) {
    super(message);
    this.name = "DokopointError";
  }
}

export async function safeDokopoint<T>(
  fn: () => Promise<T>,
  entityType: string,
  entityId?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Dokopoint] ${entityType} ${entityId ?? ""}: ${message}`);

    // Log to DB (fire and forget)
    prisma.dokopointSyncLog
      .create({
        data: {
          entityType,
          entityId: entityId ?? null,
          action: "sync",
          status: "error",
          errorMessage: message,
        },
      })
      .catch(() => {}); // ignore log errors

    return null;
  }
}
