import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rooming House Index — Find a Room",
  description:
    "Browse rooming house rooms across Victoria, or unlock suburb-level market data for investors on the same account.",
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
