import { dokopointRequest } from "./client";
import { safeDokopoint } from "./errors";
import { prisma } from "@/lib/prisma";

export const ORDER_STATUS = {
  WAIT_FOR_APPROVE: 10,
  NEW_ORDER: 11,
  IN_PREPARATION: 12,
  READY: 13,
  ON_THE_WAY: 14,
  DELIVERED: 15,
  CANCELED: 18,
  DECLINED: 19,
} as const;

export const ORDER_SOURCE = {
  POS: 1,
  TABLE: 2,
  KIOSK: 3,
  WEBSITE: 4,
  MOBILE_APP: 5,
} as const;

export function mapOurStatusToDokopoint(ourStatus: string): number {
  const map: Record<string, number> = {
    NEW: ORDER_STATUS.NEW_ORDER,
    WAITING_PAYMENT: ORDER_STATUS.WAIT_FOR_APPROVE,
    PAID: ORDER_STATUS.NEW_ORDER,
    IN_PRODUCTION: ORDER_STATUS.IN_PREPARATION,
    READY: ORDER_STATUS.READY,
    SHIPPED: ORDER_STATUS.ON_THE_WAY,
    DELIVERED: ORDER_STATUS.DELIVERED,
    COMPLETED: ORDER_STATUS.DELIVERED,
    CANCELLED: ORDER_STATUS.CANCELED,
  };
  return map[ourStatus] ?? ORDER_STATUS.NEW_ORDER;
}

export async function createDokopointOrder(order: {
  id: string; // our DB id
  dokopointCustomerId: number;
  customerName: string;
  customerPhone?: string;
  supplyMethodId?: number;
  items: Array<{
    code: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) {
  return safeDokopoint(async () => {
    const res = await dokopointRequest<{ id: number }>("POST", "/pos/orders", {
      supply_method_id: order.supplyMethodId ?? 1,
      source: ORDER_SOURCE.WEBSITE,
      customer_id: order.dokopointCustomerId,
      customer_name: order.customerName,
      customer_cell_phone: order.customerPhone,
      status_cases_id: ORDER_STATUS.NEW_ORDER,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        dokopointOrderId: res.id,
        dokopointSyncedAt: new Date(),
      },
    });

    return res;
  }, "order", order.id);
}

export async function updateDokopointOrderStatus(
  orderId: string,
  dokopointOrderId: number,
  ourStatus: string
) {
  return safeDokopoint(
    () =>
      dokopointRequest("PATCH", `/pos/orders/${dokopointOrderId}`, {
        status_cases_id: mapOurStatusToDokopoint(ourStatus),
      }),
    "order_status",
    orderId
  );
}
