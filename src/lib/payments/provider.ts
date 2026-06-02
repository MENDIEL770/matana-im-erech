export interface PaymentResult {
  success: boolean;
  chargeId?: string;
  providerData?: object;
  error?: string;
}

export interface PaymentProvider {
  createCharge(amount: number, currency: string, metadata?: object): Promise<PaymentResult>;
  refund(chargeId: string): Promise<{ success: boolean }>;
  getPaymentUrl?(amount: number, orderId: string): Promise<string>;
}

// Placeholder — יוחלף ב-Grow / Tranzila / Pelecard
export class MockPaymentProvider implements PaymentProvider {
  async createCharge(amount: number) {
    console.log(`[Payment Placeholder] Charge: ${amount} ILS`);
    return { success: true, chargeId: `mock-${Date.now()}` };
  }
  async refund(chargeId: string) {
    console.log(`[Payment Placeholder] Refund: ${chargeId}`);
    return { success: true };
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
