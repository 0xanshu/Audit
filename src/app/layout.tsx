import "../styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
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

const tomatoGrotesk = localFont({
  src: [
    {
      path: "../styles/fonts/TomatoGrotesk-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-ThinSlanted.otf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-ExtraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-ExtraLightSlanted.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-LightSlanted.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-Slanted.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-MediumSlanted.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-SemiBoldSlanted.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../styles/fonts/TomatoGrotesk-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-tomato",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${tomatoGrotesk.variable} font-sans`}
    >
      <body>{children}</body>
    </html>
  );
}
