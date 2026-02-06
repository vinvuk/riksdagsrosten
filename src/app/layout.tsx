import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import { getDb } from "@/lib/db";
import type { Member, VotingEventWithTitle } from "@/lib/types";
import "./globals.css";

/**
 * Fetches search data for the command palette.
 * @returns Object with members and votes arrays
 */
function getSearchData() {
  const db = getDb();
  try {
    const members = db
      .prepare("SELECT * FROM members ORDER BY efternamn, tilltalsnamn")
      .all() as Member[];

    const votes = db
      .prepare(
        `SELECT ve.*, d.titel
         FROM voting_events ve
         LEFT JOIN documents d ON ve.dok_id = d.dok_id
         ORDER BY ve.datum DESC`
      )
      .all() as VotingEventWithTitle[];

    return { members, votes };
  } finally {
    db.close();
  }
}

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
  metadataBase: new URL("https://riksdagsrosten.se"),
  title: {
    default: "Riksdagsrösten – Hur röstade din riksdagsledamot?",
    template: "%s | Riksdagsrösten",
  },
  description:
    "Se hur riksdagsledamöterna röstat under mandatperioden 2022–2026. Sök på ledamot, parti eller ämne.",
  keywords: ["riksdagen", "votering", "riksdagsledamot", "parti", "politik", "sverige", "demokrati"],
  authors: [{ name: "Riksdagsrösten" }],
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: "https://riksdagsrosten.se",
    siteName: "Riksdagsrösten",
    title: "Riksdagsrösten – Hur röstade din riksdagsledamot?",
    description: "Se hur riksdagsledamöterna röstat under mandatperioden 2022–2026. Sök på ledamot, parti eller ämne.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Riksdagsrösten - Utforska riksdagens voteringar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Riksdagsrösten – Hur röstade din riksdagsledamot?",
    description: "Se hur riksdagsledamöterna röstat under mandatperioden 2022–2026.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Root layout for the application.
 * Sets Swedish language, fonts, and wraps all pages in the AppShell.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchData = getSearchData();

  return (
    <html lang="sv" data-theme="dark" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased h-full bg-white dark:bg-zinc-900`}
      >
        <AppShell searchData={searchData}>{children}</AppShell>
      </body>
    </html>
  );
}
