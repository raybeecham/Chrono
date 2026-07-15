import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chrono | Don’t read history. Live it.",
  description:
    "Chrono is an AI-powered time machine that turns history into immersive, interactive worlds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
