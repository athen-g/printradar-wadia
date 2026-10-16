import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrintRadar — Wadia",
  description: "Student-reported print shop crowds around Wadia College and Connaught Place, Pune.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
