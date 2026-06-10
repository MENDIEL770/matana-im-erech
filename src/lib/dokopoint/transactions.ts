import { dokopointRequest } from "./client";
import { safeDokopoint } from "./errors";

export async function getTransactions(dateFrom: string, dateTo: string) {
  return safeDokopoint(
    () =>
      dokopointRequest("GET", "/pos/transactions", undefined, {
        date_ref: `${dateFrom},${dateTo}`,
        with: "products,payments",
      }),
    "transactions"
  );
}

export async function getMonthlyReport(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const from = `${year}-${pad(month)}-01 00:00:00`;
  const to = `${year}-${pad(month)}-31 23:59:59`;
  return getTransactions(from, to);
}
