export type ShipmentStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed";

export interface CreateShipmentInput {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface ShippingProvider {
  createShipment(input: CreateShipmentInput): Promise<{ trackingNumber: string; providerData?: object }>;
  getStatus(trackingNumber: string): Promise<{ status: ShipmentStatus; providerData?: object }>;
}
