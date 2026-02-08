import jsPDF from "jspdf";
import { Order } from "@/types/order";
import { User } from "next-auth";

export const generateReceipt = (order: Order, user?: User) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200], // Thermal paper size approx 80mm width
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 5;
  let y = 10;

  // Helper for centered text
  const centerText = (text: string, yPos: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const textWidth =
      (doc.getStringUnitWidth(text) * fontSize) / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, yPos);
  };

  // Header
  centerText("RESTORAN", y, 14);
  y += 6;
  centerText("Jl. Contoh No. 123", y, 8);
  y += 4;
  centerText("Telp: 0812-3456-7890", y, 8);
  y += 8;

  // Divider
  doc.setLineWidth(0.1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Order Info
  doc.setFontSize(9);
  doc.text(`No: #${order.id}`, margin, y);
  y += 4;
  doc.text(
    `Tgl: ${new Date(order.created_at || "").toLocaleDateString("id-ID")}`,
    margin,
    y,
  );
  y += 4;
  doc.text(`Meja: ${order.table?.table_name || order.table_id}`, margin, y);
  y += 4;
  doc.text(`Kasir: ${order.cashier?.name || user?.name || "-"}`, margin, y); // Ideally show cashier name if available
  y += 6;

  // Divider
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Items
  order.order_items.forEach((item) => {
    const foodName = item.food?.name || "Item";
    const qty = item.quantity;
    const price = item.price_at_time;
    const subtotal = item.subtotal;

    // Item line
    doc.text(`${foodName}`, margin, y);
    y += 4;

    // Qty x Price = Subtotal
    // Right align subtotal
    const subtotalStr = new Intl.NumberFormat("id-ID").format(subtotal);
    const subtotalWidth =
      (doc.getStringUnitWidth(subtotalStr) * 9) / doc.internal.scaleFactor;

    doc.text(
      `${qty} x ${new Intl.NumberFormat("id-ID").format(price)}`,
      margin + 2,
      y,
    );
    doc.text(subtotalStr, pageWidth - margin - subtotalWidth, y);
    y += 5;
  });

  // Divider
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Total
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", margin, y);

  const totalStr = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(order.total_price);

  const totalWidth =
    (doc.getStringUnitWidth(totalStr) * 9) / doc.internal.scaleFactor;
  doc.text(totalStr, pageWidth - margin - totalWidth, y);

  // Footer
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  centerText("Terima Kasih", y);
  y += 4;
  centerText("Silakan Datang Kembali", y);

  // Save/Print
  doc.autoPrint();
  const pdfBlob = doc.output("bloburl");
  window.open(pdfBlob, "_blank");
};
