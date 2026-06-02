export interface SMSProvider {
  send(phone: string, message: string): Promise<{ success: boolean; reference?: string }>;
}

export const SMS_TEMPLATES = {
  ORDER_RECEIVED: (name: string, orderNumber: string) =>
    `שלום ${name}, הזמנתך מספר ${orderNumber} התקבלה בהצלחה. תודה!`,
  IN_PRODUCTION: (orderNumber: string) =>
    `הזמנה ${orderNumber} נכנסה לייצור. נעדכן כשתהיה מוכנה.`,
  READY: (orderNumber: string) =>
    `הזמנה ${orderNumber} מוכנה ותישלח בקרוב.`,
  SHIPPED: (orderNumber: string, tracking: string) =>
    `הזמנה ${orderNumber} נשלחה. מספר מעקב: ${tracking}`,
  OUT_FOR_DELIVERY: () => `המשלוח שלך צפוי להגיע היום!`,
  DELIVERED: () => `המשלוח נמסר בהצלחה. תודה שבחרת מתנה עם ערך!`,
};
