import { dokopointRequest } from "./client";
import { safeDokopoint } from "./errors";
import { prisma } from "@/lib/prisma";

export async function createDokopointProduct(product: {
  id: string; // our DB id
  code: string;
  name: string;
  type?: string;
  departmentId?: number;
}) {
  return safeDokopoint(async () => {
    const res = await dokopointRequest<{ id: number }>("POST", "/products", {
      code: product.code,
      name: product.name,
      type: product.type ?? "product",
      department_id: product.departmentId,
      status: true,
    });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        dokopointProductId: res.id,
        dokopointSyncedAt: new Date(),
      },
    });

    return res;
  }, "product", product.id);
}

export async function upsertDokopointProduct(product: {
  id: string;
  code: string;
  name: string;
  price?: number;
  type?: string;
}) {
  return safeDokopoint(async () => {
    const res = await dokopointRequest<{ id: number }>("PUT", "/products", {
      data: {
        code: product.code,
        name: product.name,
        s_price: product.price,
        type: product.type ?? "product",
        status: true,
      },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        dokopointProductId: res.id,
        dokopointSyncedAt: new Date(),
      },
    });

    return res;
  }, "product", product.id);
}

export async function syncProductsFromDokopoint(since?: string) {
  return safeDokopoint(
    () =>
      dokopointRequest("GET", "/products", undefined, {
        ...(since ? { sync_date: since } : {}),
        status: "true",
      }),
    "product_sync"
  );
}
