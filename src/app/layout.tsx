import "../styles/globals.css";

import { type Metadata } from "next";
import { Manrope } from "next/font/google";

export const metadata: Metadata = {
  title: "AuditPro",
  description: "Audit your money",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} font-sans`}>
      <body>{children}</body>
    </html>
  );
}
