import * as XLSX from "xlsx";

export async function GET() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["name", "sku", "quantity", "price", "category"],
    ["Sample Item", "SKU-001", 10, 99.99, "General"],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Items");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  return new Response(buf as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=items_template.xlsx",
    },
  });
}
