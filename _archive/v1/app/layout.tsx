import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Inline script that runs before paint to prevent flash of incorrect theme.
 * Reads localStorage, falls back to prefers-color-scheme, defaults to dark.
 */
const themeScript = `(function(){try{var s=localStorage.getItem("theme");if(s==="light"||s==="dark"){document.documentElement.setAttribute("data-theme",s);return}if(window.matchMedia("(prefers-color-scheme: light)").matches){document.documentElement.setAttribute("data-theme","light")}}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: "Riksdagsrösten – Hur röstade din riksdagsledamot?",
    template: "%s | Riksdagsrösten",
  },
  description:
    "Se hur riksdagsledamöterna röstat under mandatperioden 2022–2026. Sök på ledamot, parti eller ämne.",
};

/**
 * Root layout for the application.
 * Sets Swedish language, fonts, and wraps all pages in Header/Footer.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
