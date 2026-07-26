import type { Metadata } from "next";
import "./globals.css";
import { SupportChatWidget } from "@/components/support-chat-widget";

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
      <body>
        {children}
        <SupportChatWidget />
      </body>
    </html>
  );
}
