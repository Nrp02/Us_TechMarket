import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Every numeric value renders in mono, per the design system.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "US TechMarket",
  description: "Daily AI intelligence for US Technology stocks.",
};

// Dark is the default theme, so <html> ships with data-theme="dark" and this
// script only downgrades to light for a visitor who chose it. Running before
// first paint is the whole point: set it in an effect instead and every page
// load flashes dark before correcting itself. Keep the storage key in sync with
// THEME_STORAGE_KEY in components/theme-toggle.tsx.
const THEME_INIT = `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      // The script below rewrites data-theme before React hydrates, so for a
      // light-mode visitor the server HTML and the live DOM legitimately differ
      // on this one attribute. Scoped to <html>'s own attributes, not the tree.
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="flex min-h-full">
        <Sidebar />
        <main className="flex-1 bg-surface-soft">{children}</main>
      </body>
    </html>
  );
}
