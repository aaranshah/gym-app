import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const ui = Geist({ variable: "--font-ui", subsets: ["latin"] });
const code = Geist_Mono({ variable: "--font-code", subsets: ["latin"] });
const text = Newsreader({ variable: "--font-text", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Cadence — natural rewriting that keeps your meaning",
  description:
    "Cadence rewrites text so it reads naturally and fluently, while checking that every fact, figure and nuance survives.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#121211" },
  ],
};

// Apply the saved theme before paint to avoid a flash of the wrong theme.
const themeScript = `try{var t=localStorage.getItem("cadence.theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${ui.variable} ${code.variable} ${text.variable} antialiased`}>{children}</body>
    </html>
  );
}
