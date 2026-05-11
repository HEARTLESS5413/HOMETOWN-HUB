import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LokConnect — Hyperlocal Community Networking",
  description: "Connect with people from your hometown, city, or village. Share updates, organize events, preserve culture, and build local networks on LokConnect.",
  keywords: ["community", "networking", "hometown", "local", "events", "hyperlocal"],
  openGraph: {
    title: "LokConnect — Hyperlocal Community Networking",
    description: "Your Digital Hometown Ecosystem. Connect, collaborate, and celebrate your roots.",
    type: "website",
    siteName: "LokConnect",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
