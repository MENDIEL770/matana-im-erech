import { dokopointRequest } from "./client";
import { safeDokopoint } from "./errors";
import { prisma } from "@/lib/prisma";

export async function createDokopointInvoice(order: {
  id: string; // our DB id
  docType: string;
  customerCode: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: Array<{
    code: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  sendSms?: boolean;
  sendEmail?: boolean;
}) {
  return safeDokopoint(async () => {
    const res = await dokopointRequest<{ id: number }>("POST", "/documents", {
      settings: {
        doc_type: order.docType,
        sms_send_customer: order.sendSms ?? false,
        email_send_customer: order.sendEmail ?? true,
      },
      customer: {
        type: "customer",
        code: order.customerCode,
        name: order.customerName,
        email: order.customerEmail,
        cell_phone: order.customerPhone,
      },
      cart: order.items.map((item) => ({
        code: item.code,
        name: item.name,
        s_price: item.price,
        amount: item.quantity,
        price: item.price * item.quantity,
      })),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { dokopointDocId: res.id },
    });

    return res;
  }, "document", order.id);
}
