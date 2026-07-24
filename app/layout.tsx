import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rooming House Index — Rooming House Intelligence",
  description:
    "Suburb-level data on demand, vacancy, and rental rates for rooming house investors across Victoria.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
