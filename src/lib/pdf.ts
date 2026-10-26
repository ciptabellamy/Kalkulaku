import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "@/lib/format";
import type { AmortizationRow } from "@/lib/calc";
import {
  buildSummaryLines,
  getSchedule,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  type SummaryData,
} from "@/lib/summary";

export const generatePDF = (data: SummaryData): void => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // ── Header: Logo box + site name
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, 10, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("K", margin + 5, y + 7, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text(SITE_NAME, margin + 14, y + 5);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(SITE_TAGLINE, margin + 14, y + 9.5);

  y += 16;

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Ringkasan Simulasi ${data.config.label}`, margin, y);
  y += 6;

  // ── Summary table
  const summaryLines = buildSummaryLines(data);
  autoTable(doc, {
    startY: y,
    head: [["Informasi", "Nilai"]],
    body: summaryLines.map((l) => [l.label, l.value]),
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: "normal" },
      1: { cellWidth: "auto", halign: "right", fontStyle: "bold", textColor: [15, 23, 42] },
    },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error jspdf-autotable augments the doc at runtime
  y = doc.lastAutoTable.finalY + 10;

  // ── Logo + site name divider between summary and schedule
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, 10, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("K", margin + 5, y + 7, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text(SITE_NAME, margin + 14, y + 5);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(SITE_TAGLINE, margin + 14, y + 9.5);

  y += 16;

  // ── Amortization schedule title
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Jadwal Angsuran Detail", margin, y);
  y += 4;

  const schedule: AmortizationRow[] = getSchedule(data.result, data.method);

  autoTable(doc, {
    startY: y,
    head: [["Bulan", "Cicilan", "Bunga", "Pokok", "Sisa Saldo"]],
    body: schedule.map((row) => [
      String(row.month),
      formatRupiah(row.payment),
      formatRupiah(row.interest),
      formatRupiah(row.principal),
      formatRupiah(row.balance),
    ]),
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85], halign: "right" },
    columnStyles: {
      0: { halign: "center", cellWidth: 15, fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: "auto" },
      3: { cellWidth: "auto" },
      4: { cellWidth: "auto" },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      // Footer on every page
      const footerY = pageHeight - 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `${SITE_NAME} — ${SITE_TAGLINE} | ${SITE_URL}`,
        pageWidth / 2,
        footerY,
        { align: "center" },
      );
    },
  });

  const filename = `Simulasi-${data.config.id}-${data.tenorMonths}bulan.pdf`;
  doc.save(filename);
};
