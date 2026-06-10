import { dokopointRequest } from "./client";
import { safeDokopoint } from "./errors";
import { prisma } from "@/lib/prisma";

export async function createDokopointCustomer(customer: {
  id: string; // our DB id
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  vatId?: string;
}) {
  return safeDokopoint(async () => {
    const res = await dokopointRequest<{ id: number }>("POST", "/customers", {
      code: "auto",
      name: customer.name,
      type: "customer",
      cell_phone: customer.phone,
      email: customer.email,
      city: customer.city,
      address: customer.address,
      vat_id: customer.vatId,
    });

    // Save dokopoint_customer_id back to our DB
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        dokopointCustomerId: res.id,
        dokopointSyncedAt: new Date(),
      },
    });

    return res;
  }, "customer", customer.id);
}

export async function updateDokopointCustomer(
  dokopointId: number,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    address?: string;
  }
) {
  return safeDokopoint(
    () =>
      dokopointRequest("PATCH", `/customers/${dokopointId}`, {
        name: data.name,
        cell_phone: data.phone,
        email: data.email,
        city: data.city,
        address: data.address,
      }),
    "customer",
    String(dokopointId)
  );
}

export async function syncCustomersFromDokopoint(since?: string) {
  return safeDokopoint(
    () =>
      dokopointRequest("GET", "/customers", undefined, {
        ...(since ? { sync_date: since } : {}),
        with: "profile_img",
      }),
    "customer_sync"
  );
}
