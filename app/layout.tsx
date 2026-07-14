import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal Ledger | Commercial Conversation Intelligence",
  description: "A deterministic portfolio demonstration using precomputed fictional sales-call analyses.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

