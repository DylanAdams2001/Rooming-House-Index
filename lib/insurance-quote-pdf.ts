import { formatInsuranceDetails, type InsuranceDetails } from "@/lib/insurance-quote";

// Client-only — dynamically imported by the download button so jsPDF never
// lands in a server bundle or the admin page's initial client chunk.
export async function downloadInsuranceQuotePdf(
  propertyAddress: string,
  details: InsuranceDetails
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const marginX = 48;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 56;

  function ensureSpace(next: number) {
    if (y + next > pageHeight - 48) {
      doc.addPage();
      y = 56;
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Landlord Insurance Quote Details", marginX, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(propertyAddress, marginX, y);
  y += 28;
  doc.setTextColor(0);

  const sections = formatInsuranceDetails(details).reduce<
    Record<string, { label: string; value: string }[]>
  >((acc, row) => {
    (acc[row.section] ??= []).push(row);
    return acc;
  }, {});

  for (const [section, rows] of Object.entries(sections)) {
    ensureSpace(26);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(section, marginX, y);
    y += 6;
    doc.setDrawColor(220);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const row of rows) {
      ensureSpace(16);
      doc.setTextColor(120);
      doc.text(row.label, marginX, y);
      doc.setTextColor(0);
      const valueLines = doc.splitTextToSize(row.value, pageWidth - marginX * 2 - 200);
      doc.text(valueLines, marginX + 200, y);
      y += 14 * Math.max(1, valueLines.length);
    }
    y += 10;
  }

  const filename = `insurance-quote-${propertyAddress
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}.pdf`;
  doc.save(filename);
}
