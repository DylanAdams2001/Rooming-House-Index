"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import type { InsuranceDetails } from "@/lib/insurance-quote";

export function DownloadInsuranceQuoteButton({
  propertyAddress,
  details,
}: {
  propertyAddress: string;
  details: InsuranceDetails;
}) {
  const [downloading, setDownloading] = useState(false);

  async function handleClick() {
    setDownloading(true);
    const { downloadInsuranceQuotePdf } = await import("@/lib/insurance-quote-pdf");
    await downloadInsuranceQuotePdf(propertyAddress, details);
    setDownloading(false);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={downloading}>
      {downloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Download PDF
    </Button>
  );
}
