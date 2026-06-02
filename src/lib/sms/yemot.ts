import type { SMSProvider } from "./provider";
import { prisma } from "@/lib/prisma";

export class YemotSMS implements SMSProvider {
  private apiKey:       string;
  private apiUrl:       string;
  private systemNumber: string;

  constructor() {
    this.apiKey       = process.env.YEMOT_API_KEY       ?? "";
    this.apiUrl       = process.env.YEMOT_API_URL       ?? "https://www.call2all.co.il/ym/api";
    this.systemNumber = process.env.YEMOT_SYSTEM_NUMBER ?? "";
  }

  async send(phone: string, message: string): Promise<{ success: boolean; reference?: string }> {
    const normalized = normalizePhone(phone);
    let success   = false;
    let reference: string | undefined;
    let status    = "pending";

    try {
      const params = new URLSearchParams({
        token:   this.apiKey,
        phones:  normalized,
        message,
      });

      const res  = await fetch(`${this.apiUrl}/SendSms?${params.toString()}`);
      const data = await res.json();

      console.log(`[Yemot SMS] To: ${normalized} | Response:`, data);

      success   = data.responseStatus === "OK" && data.sendCount > 0;
      reference = data.CampaignId ?? undefined;
      status    = success ? "sent" : "failed";
    } catch (err) {
      console.error("[Yemot SMS] Error:", err);
      status = "error";
    }

    try {
      await prisma.smsLog.create({
        data: { phone: normalized, message, status, provider: "yemot", reference },
      });
    } catch {}

    return { success, reference };
  }
}

function normalizePhone(phone: string): string {
  // הסר כל תו שאינו ספרה
  const digits = phone.replace(/\D/g, "");

  // כבר בפורמט בינלאומי עם 972
  if (digits.startsWith("972") && digits.length === 12) return digits;

  // פורמט ישראלי: 05XXXXXXXX (10 ספרות)
  if (digits.startsWith("05") && digits.length === 10) return "972" + digits.slice(1);

  return digits;
}

export const smsProvider: SMSProvider = new YemotSMS();
