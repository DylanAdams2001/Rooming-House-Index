import type { Metadata } from "next";
import "driver.js/dist/driver.css";
import "./globals.css";
import { SupportChatWidget } from "@/components/support-chat-widget";
import { TopProgressBar } from "@/components/top-progress-bar";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Rooming House Standard — Find a Room",
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
        <TopProgressBar />
        <PageTransition skipShellRoutes>{children}</PageTransition>
        <SupportChatWidget />
        <Toaster />
      </body>
    </html>
  );
}
