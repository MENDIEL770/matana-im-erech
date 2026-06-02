export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  businessNumber?: string;
  items: Array<{ name: string; quantity: number; unitPrice: number; total: number }>;
  total: number;
  type: "TAX" | "RECEIPT" | "CREDIT";
}

export interface InvoiceProvider {
  createInvoice(data: InvoiceData): Promise<{ invoiceNumber: string; url?: string; providerRef?: string }>;
  getInvoice(ref: string): Promise<{ url: string }>;
}

// Placeholder — יוחלף ב-iCount / Morning / EZCount / Green Invoice
export class MockInvoiceProvider implements InvoiceProvider {
  async createInvoice(data: InvoiceData) {
    const invoiceNumber = `INV-${Date.now()}`;
    console.log(`[Invoice Placeholder] Created ${invoiceNumber} for order ${data.orderId}`);
    return { invoiceNumber };
  }
  async getInvoice(ref: string) {
    return { url: `/invoices/${ref}` };
  }
}

export const invoiceProvider: InvoiceProvider = new MockInvoiceProvider();
