import * as XLSX from "xlsx";

export interface ProductFieldConfig {
  fieldKey: string;
  label: string;
  isRequired: boolean;
}

export interface ExcelTemplateOptions {
  productName: string;
  fields: ProductFieldConfig[];
  shippingType: "CONSOLIDATED" | "DIRECT_TO_DONORS";
  quantity?: number;
}

export function generateExcelTemplate(options: ExcelTemplateOptions): Buffer {
  const { productName, fields, shippingType } = options;

  const baseFields = [
    { fieldKey: "row_number", label: "מס׳" },
  ];

  const shippingFields =
    shippingType === "DIRECT_TO_DONORS"
      ? [
          { fieldKey: "address", label: "כתובת" },
          { fieldKey: "city", label: "עיר" },
          { fieldKey: "phone", label: "טלפון" },
        ]
      : [];

  const allFields = [...baseFields, ...fields, ...shippingFields];
  const headers = allFields.map((f) => f.label);

  const wb = XLSX.utils.book_new();
  const wsData = [
    [`הזמנה - ${productName}`],
    [],
    headers,
  ];

  // Add example rows
  for (let i = 1; i <= 5; i++) {
    wsData.push(allFields.map((_f, idx) => (idx === 0 ? String(i) : "")));
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style header row (row index 2)
  const headerRange = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
  ws["!cols"] = allFields.map(() => ({ wch: 20 }));

  // Merge title cell
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

  XLSX.utils.book_append_sheet(wb, ws, "הזמנה");

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

export function parseExcelUpload(buffer: Buffer): Record<string, string>[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
    defval: "",
    raw: false,
  });
  return rows;
}
